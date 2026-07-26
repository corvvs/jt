import { atom, useAtom, useSetAtom } from "jotai";
import type { createStore } from "jotai";
import { v4 as uuidv4 } from "uuid";
import {
  HIGHLIGHT_PALETTE_SIZE,
  HighlightMaps,
  HighlightRule,
  computeHighlightMaps,
} from "@/libs/highlight";
import { QueryMode, filteringPreferenceAtom, filteringQueryAtom } from "./manipulation/query";
import { effectiveItemsAtom } from "./json";
import { diffTargetAtom } from "./diff";
import { activeRightPanelAtom } from "./right_panel";

type JotaiStore = ReturnType<typeof createStore>;

/**
 * ハイライトルールの状態. 設計は libs/highlight.ts の冒頭コメント参照.
 * 永続化まわりは states/saved_queries.ts と同じ方針 (グローバル / localStorage)。
 */

const STORAGE_KEY = "highlightRules";

/** localStorage の内容を信用せず, 形の正しいルールだけ拾う */
const sanitizeRule = (raw: any): HighlightRule | null => {
  if (!raw || typeof raw !== "object") { return null; }
  if (typeof raw.id !== "string" || typeof raw.query !== "string") { return null; }
  const color = typeof raw.color === "number" && 0 <= raw.color && raw.color < HIGHLIGHT_PALETTE_SIZE
    ? Math.floor(raw.color)
    : 0;
  return {
    id: raw.id,
    name: typeof raw.name === "string" ? raw.name : "",
    query: raw.query,
    mode: raw.mode === "simple" ? "simple" : "advanced",
    color,
    enabled: !!raw.enabled,
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : 0,
  };
};

const loadFromStorage = (): HighlightRule[] => {
  if (typeof window === "undefined") { return []; } // SSR ガード
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { return []; }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) { return []; }
    return parsed.map(sanitizeRule).filter((r): r is HighlightRule => !!r);
  } catch (e) {
    console.error("Failed to load highlight rules:", e);
    return [];
  }
};

const saveToStorage = (rules: HighlightRule[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch (e) {
    console.error("Failed to save highlight rules:", e);
  }
};

const highlightRulesAtom = atom<HighlightRule[]>([]);

/**
 * localStorage からルールを読み込む (アプリ起動時に1回).
 * 購読を持たない setter-only hook なので, 呼び出し元を再レンダリングさせない.
 */
export const useHighlightRulesLoader = () => {
  const setRules = useSetAtom(highlightRulesAtom);
  return {
    loadHighlightRules: () => setRules(loadFromStorage()),
  };
};

export const useHighlightRules = () => {
  const [highlightRules, setHighlightRules] = useAtom(highlightRulesAtom);

  // メモリ即時更新 + localStorage 永続化をまとめて行う
  const persist = (next: HighlightRule[]) => {
    setHighlightRules(next);
    saveToStorage(next);
  };

  const addRule = (params: {
    name: string;
    query: string;
    mode: QueryMode;
    color: number;
  }): HighlightRule => {
    const item: HighlightRule = {
      id: uuidv4(),
      name: params.name,
      query: params.query,
      mode: params.mode,
      color: params.color,
      enabled: true,
      createdAt: Date.now(),
    };
    persist([item, ...highlightRules]); // 先頭 = 最優先に積む (Wireshark の coloring rules と同じ)
    return item;
  };

  const removeRule = (id: string) => {
    persist(highlightRules.filter((r) => r.id !== id));
  };

  const updateRule = (
    id: string,
    patch: Partial<Pick<HighlightRule, "name" | "query" | "mode" | "color" | "enabled">>,
  ) => {
    persist(highlightRules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const toggleRule = (id: string) => {
    persist(highlightRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  /** direction: -1 = 上へ (優先度を上げる) / +1 = 下へ */
  const moveRule = (id: string, direction: -1 | 1) => {
    const index = highlightRules.findIndex((r) => r.id === id);
    const to = index + direction;
    if (index < 0 || to < 0 || to >= highlightRules.length) { return; }
    const next = [...highlightRules];
    [next[index], next[to]] = [next[to], next[index]];
    persist(next);
  };

  return {
    highlightRules,
    hasRules: highlightRules.length > 0,
    addRule,
    removeRule,
    updateRule,
    toggleRule,
    moveRule,
  };
};

/**
 * 行 index → 色 / ルール毎のマッチ数.
 * diff モードでは無効 (行背景が diff 状態で占有されるため。ピン・共有と同じ前例)。
 * 有効ルールが無ければ null (行描画・ミニマップは何もしない)。
 */
export const highlightMapsAtom = atom((get): HighlightMaps | null => {
  if (get(diffTargetAtom)) { return null; }
  const rules = get(highlightRulesAtom);
  if (!rules.some((r) => r.enabled)) { return null; }
  const json = get(effectiveItemsAtom);
  if (!json) { return null; }
  return computeHighlightMaps(json.items, rules);
});

/**
 * ルールを検索ボックスへ送る (注釈 → 探索への明示的なモード遷移).
 * atom を直接 set するのは applySavedQuery と同じ理由 (states/saved_queries.ts 参照)。
 * resultAppearance には触らない — ルールは結果の表示方法という概念を持たない。
 */
export const applyRuleToSearch = (store: JotaiStore, rule: HighlightRule) => {
  store.set(filteringQueryAtom, rule.query);
  store.set(filteringPreferenceAtom, {
    ...store.get(filteringPreferenceAtom),
    mode: rule.mode,
    showPanel: true,
  });
};

/** 右パネルは排他 (states/right_panel.ts 参照) */
export const useHighlightPreference = () => {
  const [activePanel, setActivePanel] = useAtom(activeRightPanelAtom);
  return {
    highlightPreference: { showPanel: activePanel === "highlight" },
    setShowHighlightPanel: (value: boolean) => setActivePanel(
      (prev) => (value ? "highlight" : prev === "highlight" ? null : prev)
    ),
  } as const;
};
