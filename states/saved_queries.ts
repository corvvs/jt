import { atom, useAtom, useSetAtom } from "jotai";
import type { createStore } from "jotai";
import { v4 as uuidv4 } from "uuid";
import {
  QueryMode,
  FilteringResultAppearanceOption,
  filteringQueryAtom,
  filteringPreferenceAtom,
} from "./manipulation/query";

type JotaiStore = ReturnType<typeof createStore>;

/**
 * 保存済みクエリ 1 件.
 * 検索結果を再現するのに必要なのは query + mode + resultAppearance の3点
 * (libs/share.ts SharedViewState から narrowing/folding を除いたサブセット).
 * ドキュメント横断で使い回すためグローバル (localStorage) に持つ.
 */
export type SavedQuery = {
  id: string;
  name: string; // 空なら一覧では query を表示名にする
  query: string;
  mode: QueryMode;
  resultAppearance: FilteringResultAppearanceOption;
  createdAt: number; // epoch ms
};

const STORAGE_KEY = "savedQueries";

const loadFromStorage = (): SavedQuery[] => {
  if (typeof window === "undefined") { return []; } // SSR ガード
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { return []; }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to load saved queries:", e);
    return [];
  }
};

const saveToStorage = (queries: SavedQuery[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
  } catch (e) {
    console.error("Failed to save saved queries:", e);
  }
};

const savedQueriesAtom = atom<SavedQuery[]>([]);

/**
 * localStorage から保存済みクエリを読み込む (アプリ起動時に1回).
 * 購読を持たない setter-only hook なので, 呼び出し元を再レンダリングさせない.
 */
export const useSavedQueriesLoader = () => {
  const setSavedQueries = useSetAtom(savedQueriesAtom);
  return {
    loadSavedQueries: () => setSavedQueries(loadFromStorage()),
  };
};

export const useSavedQueries = () => {
  const [savedQueries, setSavedQueries] = useAtom(savedQueriesAtom);

  // メモリ即時更新 + localStorage 永続化をまとめて行う
  const persist = (next: SavedQuery[]) => {
    setSavedQueries(next);
    saveToStorage(next);
  };

  const addQuery = (params: {
    name: string;
    query: string;
    mode: QueryMode;
    resultAppearance: FilteringResultAppearanceOption;
  }): SavedQuery => {
    const item: SavedQuery = {
      id: uuidv4(),
      name: params.name,
      query: params.query,
      mode: params.mode,
      resultAppearance: params.resultAppearance,
      createdAt: Date.now(),
    };
    persist([item, ...savedQueries]); // 新しい順で先頭に積む
    return item;
  };

  const removeQuery = (id: string) => {
    persist(savedQueries.filter((q) => q.id !== id));
  };

  const renameQuery = (id: string, name: string) => {
    persist(savedQueries.map((q) => (q.id === id ? { ...q, name } : q)));
  };

  return {
    savedQueries,
    hasSavedQueries: savedQueries.length > 0,
    addQuery,
    removeQuery,
    renameQuery,
  };
};

/**
 * 保存済みクエリを検索に再適用する.
 * atom を直接 set する: setFilteringMode 等の hook 経由だと localStorage の
 * 既定モード/表示形まで書き換えてしまうため (states/share.ts applySharedViewState と同方針).
 */
export const applySavedQuery = (store: JotaiStore, saved: SavedQuery) => {
  store.set(filteringQueryAtom, saved.query);
  store.set(filteringPreferenceAtom, {
    ...store.get(filteringPreferenceAtom),
    mode: saved.mode,
    resultAppearance: saved.resultAppearance,
    showPanel: true,
  });
};
