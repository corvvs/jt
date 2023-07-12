import { JsonRowItem } from "@/libs/jetson";
import { atom, useAtom } from "jotai";
import _ from "lodash";
import { jsonFlattenedAtom } from "../json";
import { advancedMatcherAtom } from "@/libs/advanced_query";

export const defaultFilteringQuery = "";

type FilteringMap = {
  matched: { [k: number]: boolean };
  visible: { [k: number]: boolean };
};

export type FilteringResultAppearanceOption = "just" | "ascendant" | "descendant" | "ascendant_descendant";

type FilteringPreference = {
  mode: "simple" | "advanced";
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

        const simpleQuery = get(filteringQueryAtom).trim();
        if (simpleQuery.length === 0) { return null; }
        return (item: JsonRowItem) => {
          const key = item.itemKey?.toString().toLowerCase();
          if (key?.includes(simpleQuery)) { return true; }
          if (item.right.type === "string") {
            const key = item.right.value.toLowerCase();
            if (key.includes(simpleQuery)) {
              matchedMap[item.index] = true;
            }
          } else if (item.right.type === "number") {
            const key = item.right.value.toString().toLowerCase();
            if (key.includes(simpleQuery)) {
              matchedMap[item.index] = true;
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
    for (const item of items) {
      // item 自身がマッチした -> 自身と祖先が visible
      if (matchedMap[item.index]) {
        upperVisibleMap[item.index] = true;
        lowerVisibleMap[item.index] = true;
        // まだ visible でない祖先まで下から順に visible にしていく
        for (let i = item.rowItems.length - 1; 0 <= i; i -= 1) {
          const an = item.rowItems[i];
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

    const visibleMap: { [k: number]: boolean } = {};
    for (const item of items) {
      if (matchedMap[item.index]) {
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

