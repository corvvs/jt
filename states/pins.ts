import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import _ from "lodash";
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
 * ピンを打った直後にその行へ出すクイックメモ入力の対象キーパス.
 * Enter で確定 / Esc・フォーカス喪失で閉じる (何もしなければメモ無しのピンのまま).
 */
const pendingMemoKeypathAtom = atom<string | null>(null);

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
  const setPendingMemoKeypath = useSetAtom(pendingMemoKeypathAtom);

  const loadPinsForDocument = async (docId: string | undefined) => {
    setPendingMemoKeypath(null);
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
  const [pendingMemoKeypath, setPendingMemoKeypath] = useAtom(pendingMemoKeypathAtom);
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
    const pin: DocumentPin = {
      keypath: item.elementKey,
      memo: "",
      created_at: new Date(),
      valuePreview: pinValuePreview(item.right),
    };
    applyPins([...pinsState.pins, pin]);
    // その場でメモを打てるように, ピンを打った行にクイックメモ入力を出す
    setPendingMemoKeypath(item.elementKey);
  };

  const removePin = (keypath: string) => {
    applyPins(pinsState.pins.filter((pin) => pin.keypath !== keypath));
    if (pendingMemoKeypath === keypath) {
      setPendingMemoKeypath(null);
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
    pendingMemoKeypath,
    closePendingMemo: () => setPendingMemoKeypath(null),
    togglePin,
    removePin,
    updatePinMemo,
  };
};
