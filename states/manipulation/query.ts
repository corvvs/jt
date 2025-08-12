import { JsonRowItem } from "@/libs/jetson";
import { atom, useAtom } from "jotai";
import _ from "lodash";
import { jsonFlattenedAtom } from "../json";
import { advancedMatcherAtom } from "@/libs/advanced_query";

export const defaultFilteringQuery = "";

export type FilteringMap = {
  matched: { [k: number]: boolean };
  visible: { [k: number]: boolean };
};

type QueryMode = "simple" | "advanced";

export const ModeDescription = {
  "simple":   "キー・値に対する部分一致検索",
  "advanced": "JSONの構造自体に対する検索",
};

export type FilteringResultAppearanceOption = "just" | "ascendant" | "descendant" | "ascendant_descendant" | "lightup";

export const AppearanceDescription = {
  "ascendant_descendant": "ヒットした項目とその祖先および子孫の項目を表示する",
  "ascendant":            "ヒットした項目とその祖先の項目を表示する",
  "descendant":           "ヒットした項目とその子孫の項目を表示する",
  "just":                 "ヒットした項目のみを表示する",
  "lightup":              "ヒットした項目を強調して表示する"
};

type FilteringPreference = {
  mode: QueryMode;
  showPanel: boolean;
  resultAppearance: FilteringResultAppearanceOption;
  showAdvancedDebug: boolean;
};

export const filteringPreferenceAtom = atom<FilteringPreference>({
  mode: "simple",
  showPanel: false,
  resultAppearance: "ascendant_descendant",
  showAdvancedDebug: false,
});


export const filteringResultAppearanceAtom = atom(
  (get) => {
    const v = get(filteringPreferenceAtom).resultAppearance;
    switch (v) {
      case "just": return {
        ascendant: false,
        descendant: false,
      };
      case "ascendant": return {
        ascendant: true,
        descendant: false,
      };
      case "descendant": return {
        ascendant: false,
        descendant: true,
      };
      case "ascendant_descendant": return {
        ascendant: true,
        descendant: true,
      };
      case "lightup": return {
        ascendant: true,
        descendant: true,
        everything: true,
      };
    }
  }
);

export const filteringQueryAtom = atom<string>(defaultFilteringQuery);

export const filterMapsAtom = atom<FilteringMap | null>(
  (get) => {
    const json = get(jsonFlattenedAtom);
    if (!json) { return null; }

    const actualMatcher = (() => {
      if (get(filteringPreferenceAtom).mode === "simple") {

        const simpleQuery = get(filteringQueryAtom).trim().toLowerCase();
        // 最小2文字まで入力されるまで検索を開始しない（パフォーマンス改善）
        if (simpleQuery.length < 2) { return null; }
        return (item: JsonRowItem) => {
          const key = item.itemKey?.toString().toLowerCase();
          if (key?.includes(simpleQuery)) { return true; }
          if (item.right.type === "string") {
            const value = item.right.value.toLowerCase();
            if (value.includes(simpleQuery)) {
              return true;
            }
          } else if (item.right.type === "number") {
            const value = item.right.value.toString().toLowerCase();
            if (value.includes(simpleQuery)) {
              return true;
            }
          }
          return false;
        };

      } else {

        return get(advancedMatcherAtom).matcher;

      }
    })();
    
    if (!actualMatcher) { return null; }
    const filteringResultAppearance = get(filteringResultAppearanceAtom);

    const { items } = json;
    
    // item ごとに query にマッチしたかどうかを判定する
    const matchedMap: { [k: number]: boolean } = {};
    for (const item of items) {
      if (actualMatcher(item)) {
        matchedMap[item.index] = true;
      }
    }
    // item ごとに visible かどうかを判定する
    const upperVisibleMap: { [k: number]: boolean } = {};
    const lowerVisibleMap: { [k: number]: boolean } = {};
    if (!filteringResultAppearance.everything) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // item 自身がマッチした -> 自身と祖先が visible
        if (matchedMap[item.index]) {
          upperVisibleMap[item.index] = true;
          lowerVisibleMap[item.index] = true;
          // まだ visible でない祖先まで下から順に visible にしていく
          for (let j = item.rowItems.length - 1; 0 <= j; j -= 1) {
            const an = item.rowItems[j];
            if (upperVisibleMap[an.index]) { break; }
            upperVisibleMap[an.index] = true;
          }
          continue;
        }
        // 祖先にマッチしたものがいる -> 自身が visible
        const parent = _.last(item.rowItems);
        if (parent && lowerVisibleMap[parent.index]) {
          lowerVisibleMap[item.index] = true;
        }
      }
    }

    const visibleMap: { [k: number]: boolean } = {};
    for (const item of items) {
      if (filteringResultAppearance.everything) {
        visibleMap[item.index] = true;
      } else if (matchedMap[item.index]) {
        visibleMap[item.index] = true;
      } else if (filteringResultAppearance.ascendant && upperVisibleMap[item.index]) {
        visibleMap[item.index] = true;
      } else if (filteringResultAppearance.descendant && lowerVisibleMap[item.index]) {
        visibleMap[item.index] = true;
      }
    }
    return {
      matched: matchedMap,
      visible: visibleMap,
    };
  }
)

export const useQuery = () => {
  const [filteringQuery, setFilteringQuery] = useAtom(filteringQueryAtom);
  const [filteringPreference, setFilteringPreference] = useAtom(filteringPreferenceAtom);

  return {
    filteringPreference,
    setFilteringPreference,
    filteringQuery,
    setFilteringQuery,
  };
};

