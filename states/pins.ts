import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import _ from "lodash";
import { toast } from "react-toastify";
import { JsonRowItem } from "@/libs/jetson";
import { DocumentPin, pinValuePreview } from "@/libs/pins";
import { DocumentPinsStore } from "@/data/pins";
import { effectiveItemsAtom } from "./json";

export type PinsPreference = {
  showPanel: boolean;
};

const pinsPreferenceAtom = atom<PinsPreference>({ showPanel: false });

export const usePinsPreference = () => {
  const [pinsPreference, setPinsPreference] = useAtom(pinsPreferenceAtom);
  return {
    pinsPreference,
    setShowPinsPanel: (value: boolean) => setPinsPreference((prev) => ({ ...prev, showPanel: value })),
  } as const;
};

/**
 * 表示中ドキュメントのピン集合.
 * docId はピンの帰属先 (= IndexedDB のレコードキー). null なら未確定でピンは打てない.
 * loaded が立つまでピンは打てない: 保存済みピンの読み込み前に書き込みを許すと,
 * 遅れて届いた読み込み結果が新しいピンを上書きしたり, 逆に保存が既存ピンを消したりする.
 */
type PinsState = {
  docId: string | null;
  pins: DocumentPin[];
  loaded: boolean;
};

const pinsStateAtom = atom<PinsState>({ docId: null, pins: [], loaded: false });

/**
 * 行のピングリフ直下に出すメモバルーンの状態.
 * editing=false は読み取り専用の表示 (グリフクリック時の初手 — 誤編集を防ぐ),
 * editing=true は入力欄 (ピンを打った直後 / 表示をクリックした後)。
 */
export type PendingMemoState = {
  keypath: string;
  editing: boolean;
};

export const pendingMemoAtom = atom<PendingMemoState | null>(null);

/**
 * ピンへのジャンプ要求.
 * itemViewRef (スクロール手段) を持たないバルーン等から発行し,
 * usePinNavigation が実行する。openBalloon が真なら移動先でバルーンを表示状態で開く。
 */
export type PinJumpRequest = {
  keypath: string;
  openBalloon: boolean;
};

export const pinJumpRequestAtom = atom<PinJumpRequest | null>(null);

/**
 * 外したピンのメモの退避先 (keypath → memo).
 * メモ付きのピンを外してもメモは即座には失われず, 同じ行にピンを付け直すと復元される。
 * セッション内・ドキュメント単位の安全網で, 永続化はせずドキュメント切替でクリアされる。
 */
const removedMemosAtom = atom<Map<string, string>>(new Map());

/**
 * 行描画が O(1) でピン状態を引くための Map (keypath → pin)
 */
export const pinMapAtom = atom((get) => {
  const { pins } = get(pinsStateAtom);
  return new Map(pins.map((pin) => [pin.keypath, pin]));
});

export type ResolvedPin = {
  pin: DocumentPin;
  /** 現在のドキュメントで keypath に対応する行. 見つからなければ null (編集でズレた等) */
  item: JsonRowItem | null;
};

/**
 * キーパス → 行アイテムの逆引き.
 * ピンがあるときだけ (resolvedPinsAtom 経由で) 計算される.
 */
const keypathItemMapAtom = atom((get) => {
  const flatJsons = get(effectiveItemsAtom);
  if (!flatJsons) { return null; }
  const map = new Map<string, JsonRowItem>();
  for (const item of flatJsons.items) {
    map.set(item.elementKey, item);
  }
  return map;
});

/**
 * 一覧表示用: 行順にソートしたピン. 解決できないピンは末尾.
 */
export const resolvedPinsAtom = atom((get): ResolvedPin[] => {
  const { pins } = get(pinsStateAtom);
  if (pins.length === 0) { return []; }
  const map = get(keypathItemMapAtom);
  const resolved = pins.map((pin) => ({ pin, item: map?.get(pin.keypath) ?? null }));
  return _.sortBy(resolved, (r) => r.item ? r.item.index : Infinity);
});

const persistPins = (docId: string, pins: DocumentPin[]) => {
  DocumentPinsStore.savePins(docId, pins).catch((e) => {
    console.error("Failed to save pins:", e);
  });
};

/**
 * ドキュメントのロード完了に合わせてピンを読み込む.
 * 購読を持たない (setter のみ) ので, どこから呼んでも再レンダリングを増やさない.
 */
export const usePinsLoader = () => {
  const setPinsState = useSetAtom(pinsStateAtom);
  const setPendingMemo = useSetAtom(pendingMemoAtom);
  const setRemovedMemos = useSetAtom(removedMemosAtom);

  const loadPinsForDocument = async (docId: string | undefined) => {
    setPendingMemo(null);
    setRemovedMemos(new Map());
    // "new" は保存前の一時 ID なのでピンの帰属先にしない
    if (!docId || docId === "new") {
      setPinsState({ docId: null, pins: [], loaded: false });
      return;
    }
    setPinsState({ docId, pins: [], loaded: false });
    try {
      const pins = await DocumentPinsStore.fetchPins(docId);
      // ドキュメントが切り替わっていたら (別ロードが走っていたら) この結果は捨てる
      setPinsState((prev) => prev.docId === docId ? { docId, pins, loaded: true } : prev);
    } catch (e) {
      console.error("Failed to load pins:", e);
    }
  };

  return { loadPinsForDocument };
};

export const usePins = () => {
  const [pinsState, setPinsState] = useAtom(pinsStateAtom);
  const [pendingMemo, setPendingMemo] = useAtom(pendingMemoAtom);
  const [removedMemos, setRemovedMemos] = useAtom(removedMemosAtom);
  const pinMap = useAtomValue(pinMapAtom);

  const applyPins = (pins: DocumentPin[]) => {
    if (!pinsState.docId || !pinsState.loaded) { return; }
    setPinsState({ ...pinsState, pins });
    persistPins(pinsState.docId, pins);
  };

  const togglePin = (item: JsonRowItem) => {
    if (!pinsState.docId || !pinsState.loaded) { return; }
    if (pinMap.has(item.elementKey)) {
      removePin(item.elementKey);
      return;
    }
    // 以前このキーパスのピンを外していたら, 退避してあったメモを復元する
    const restoredMemo = removedMemos.get(item.elementKey);
    const pin: DocumentPin = {
      keypath: item.elementKey,
      memo: restoredMemo ?? "",
      created_at: new Date(),
      valuePreview: pinValuePreview(item.right),
    };
    applyPins([...pinsState.pins, pin]);
    if (restoredMemo !== undefined) {
      setRemovedMemos((prev) => {
        const next = new Map(prev);
        next.delete(item.elementKey);
        return next;
      });
    }
    // その場でメモを打てるように, ピンを打った行にメモバルーンを編集状態で出す
    // (メモを復元した場合は復元されたことがそのまま見える)
    setPendingMemo({ keypath: item.elementKey, editing: true });
  };

  const removePin = (keypath: string) => {
    const removed = pinsState.pins.find((pin) => pin.keypath === keypath);
    applyPins(pinsState.pins.filter((pin) => pin.keypath !== keypath));
    // メモ付きのピンを外すときはメモを退避し, 付け直しで戻せるようにする
    if (removed?.memo) {
      setRemovedMemos((prev) => new Map(prev).set(keypath, removed.memo));
      toast("ピンを外しました — 同じ行に付け直すとメモが戻ります");
    }
    if (pendingMemo?.keypath === keypath) {
      setPendingMemo(null);
    }
  };

  const updatePinMemo = (keypath: string, memo: string) => {
    applyPins(pinsState.pins.map((pin) => pin.keypath === keypath ? { ...pin, memo } : pin));
  };

  return {
    pins: pinsState.pins,
    hasPins: pinsState.pins.length > 0,
    /** ピンを打てる状態か (帰属先ドキュメントが確定し, 保存済みピンの読み込みが済んでいる) */
    canPin: !!pinsState.docId && pinsState.loaded,
    pinMap,
    pendingMemo,
    closePendingMemo: () => setPendingMemo(null),
    /** メモバルーンを読み取り専用の表示で開く (グリフクリックの初手) */
    openMemoView: (keypath: string) => setPendingMemo({ keypath, editing: false }),
    /** メモバルーンを編集状態にする (表示クリック後) */
    openMemoEdit: (keypath: string) => setPendingMemo({ keypath, editing: true }),
    togglePin,
    removePin,
    updatePinMemo,
  };
};
