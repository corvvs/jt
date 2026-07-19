import { atom } from "jotai";
import type { createStore } from "jotai";
import { JsonRowItem } from "@/libs/jetson";
import { SharedViewState, sanitizeSharedViewState } from "@/libs/share";
import { narrowedRangeAtom } from "./manipulation/narrowing";
import { filteringPreferenceAtom, filteringQueryAtom } from "./manipulation/query";
import { toggleAtom } from "./view";

type JotaiStore = ReturnType<typeof createStore>;

/**
 * 共有リンクからデコードしたビュー状態の一時置き場.
 * shared ルートの取り込みでセットされ, 対象ドキュメントのロード完了時に
 * 消費・適用・クリアされる (docId 不一致の場合も必ず破棄される).
 */
export type PendingViewState = {
  docId: string;
  view: SharedViewState;
};

export const pendingViewStateAtom = atom<PendingViewState | null>(null);

/**
 * 現在のビュー状態を共有ペイロード用に吸い上げる.
 * hook にせず store 経由で読むことで, 呼び出し元 (Share ボタン) が
 * toggle / narrowing の変更のたびに再レンダリングされるのを避ける.
 */
export function collectSharedViewState(store: JotaiStore): SharedViewState {
  const narrowedRanges = store.get(narrowedRangeAtom);
  const toggleState = store.get(toggleAtom);
  const preference = store.get(filteringPreferenceAtom);
  const foldedIndexes = Object.keys(toggleState)
    .map(Number)
    .filter((i) => toggleState[i])
    .sort((a, b) => a - b);
  return {
    narrowedFroms: narrowedRanges.map((r) => r.from),
    foldedIndexes,
    query: store.get(filteringQueryAtom),
    queryMode: preference.mode,
    resultAppearance: preference.resultAppearance,
    showSearchPanel: preference.showPanel,
  };
}

/**
 * 共有されたビュー状態を sanitize して atom 群へ一括注入する.
 * filteringPreferenceAtom は直接更新する: setFilteringMode 等の hook 経由だと
 * localStorage の既定値まで保存され, 共有リンクが受信者の設定を書き換えてしまう.
 */
export function applySharedViewState(store: JotaiStore, items: JsonRowItem[], view: SharedViewState) {
  const sanitized = sanitizeSharedViewState(view, items);
  store.set(narrowedRangeAtom, sanitized.narrowedRanges);
  store.set(toggleAtom, sanitized.toggleState);
  store.set(filteringQueryAtom, sanitized.query);
  store.set(filteringPreferenceAtom, {
    ...store.get(filteringPreferenceAtom),
    mode: sanitized.queryMode,
    resultAppearance: sanitized.resultAppearance,
    showPanel: sanitized.showSearchPanel,
  });
}
