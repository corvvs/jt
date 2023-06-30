import { JsonRowItem } from "@/libs/jetson";
import { atom, useAtom } from "jotai";
import _ from "lodash";
import { jsonFlattenedAtom } from "./json";
import { advancedMatcherAtom } from "@/libs/advanced_query";

type IndexRange = { from: number; to: number; };

type Manipulation = {
  /**
   * ナローイングスタック
   */
  narrowedRanges: IndexRange[];

  /**
   * 検索クエリ文字列
   */
  filteringQuery: string;
};

type FilteringMap = {
  matched: { [k: number]: boolean };
  visible: { [k: number]: boolean };
};

const defaultManipulation: Manipulation = {
  narrowedRanges: [],
  filteringQuery: "",
};

const narrowedRangeAtom = atom<Manipulation["narrowedRanges"]>(defaultManipulation.narrowedRanges);

type FilteringVisibilityOption = "just" | "ascendant" | "descendant" | "ascendant_descendant";

type FilteringPreference = {
  mode: "simple" | "advanced";
  showPanel: boolean;
  visibility: FilteringVisibilityOption;
  showAdvancedDebug: boolean;
};

export const filteringPreferenceAtom = atom<FilteringPreference>({
  mode: "simple",
  showPanel: false,
  visibility: "ascendant_descendant",
  showAdvancedDebug: false,
});

export const filteringVisibilityAtom = atom(
  (get) => {
    const v = get(filteringPreferenceAtom).visibility;
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



export const filteringQueryAtom = atom<string>(defaultManipulation.filteringQuery);
const filterMapsAtom = atom<FilteringMap | null>(
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
    const filteringVisibility = get(filteringVisibilityAtom);

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
      } else if (filteringVisibility.ascendant && upperVisibleMap[item.index]) {
        visibleMap[item.index] = true;
      } else if (filteringVisibility.descendant && lowerVisibleMap[item.index]) {
        visibleMap[item.index] = true;
      }
    }
    return {
      matched: matchedMap,
      visible: visibleMap,
    };
  }
)

const deriveNarrowdRange = (index: number, items: JsonRowItem[]) => {
  const indexFrom = index;
  const itemFrom = items[indexFrom];
  const itemTo = _.slice(items, indexFrom + 1).find(itemTo => {
    return itemTo.rowItems.length <= itemFrom.rowItems.length || itemTo.rowItems[itemFrom.rowItems.length].elementKey !== itemFrom.elementKey;
  });
  const indexTo = itemTo ? itemTo.index : items.length;
  return {
    from: indexFrom, to: indexTo,
  };
};

export const useManipulation = () => {
  const [narrowedRanges, setNarrowedRangesRaw] = useAtom(narrowedRangeAtom);
  const [filteringQuery, setFilteringQuery] = useAtom(filteringQueryAtom);
  const [filterMaps] = useAtom(filterMapsAtom);
  const [filteringPreference, setFilteringPreference] = useAtom(filteringPreferenceAtom);
  const [filteringVisibility] = useAtom(filteringVisibilityAtom);

  const pushNarrowedRange = (index: number, allItems: JsonRowItem[]) => {
    const range = deriveNarrowdRange(index, allItems);
    if (!range) { return; }
    setNarrowedRangesRaw(prev => [...prev, range]);
  };
  const popNarrowedRange = (topIndex?: number) => {
    if (_.isFinite(topIndex)) {
      if (topIndex! < 0) {
        setNarrowedRangesRaw(prev => _.dropRight(prev));
        return;
      } else if (topIndex! < narrowedRanges.length) {
        setNarrowedRangesRaw(prev => _.slice(prev, 0, topIndex! + 1));
        return;
      }
    }
    setNarrowedRangesRaw([]);
  };

  const setFilteringVisibility = (v: FilteringVisibilityOption) => setFilteringPreference(prev => {
    const next = _.cloneDeep(prev);
    next.visibility = v;
    return  next;
  });
  const setFilteringMode = (mode: "simple" | "advanced") => setFilteringPreference(prev => {
    const next = _.cloneDeep(prev);
    next.mode = mode;
    return  next;
  });
  const setFilteringBooleanPreference = (key: "showPanel" | "showAdvancedDebug", value: boolean) => {
    setFilteringPreference(prev => {
      const next = _.cloneDeep(prev);
      next[key] = value
      return  next;
    });
  }
  

  const clearManipulation = () => {
    setNarrowedRangesRaw(defaultManipulation.narrowedRanges);
    setFilteringQuery(defaultManipulation.filteringQuery);
  };

  return {
    manipulation: {
      narrowedRanges,
      filteringQuery,
      filteringVisibility,
    },

    pushNarrowedRange,
    popNarrowedRange,
    setFilteringQuery,
    filterMaps,

    filteringPreference,
    setFilteringVisibility,
    setFilteringMode,
    setFilteringBooleanPreference,

    clearManipulation,
  };
};
