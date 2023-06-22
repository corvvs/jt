import { JsonRowItem } from "@/libs/jetson";
import { atom, useAtom } from "jotai";
import _ from "lodash";
import { jsonFlattenedAtom } from "./json";

type IndexRange = { from: number; to: number; };

type Manipulation = {
  selectedIndex: number | null;
  narrowedRanges: IndexRange[];
  simpleFilteringQuery: string;
};

type FilteringMap = {
  matched: { [k: number]: boolean };
  visible: { [k: number]: boolean };
};

const defaultManipulation: Manipulation = {
  selectedIndex: null,
  narrowedRanges: [],
  simpleFilteringQuery: "",
};

const selectedIndexAtom = atom<Manipulation["selectedIndex"]>(defaultManipulation.selectedIndex);
const narrowedRangeAtom = atom<Manipulation["narrowedRanges"]>(defaultManipulation.narrowedRanges);


type FilteringVisibilityOption = "just" | "ascendant" | "ascendant_descendant";

type FilteringPreference = {
  visibility: FilteringVisibilityOption;
};

const filteringPreferenceAtom = atom<FilteringPreference>({
  visibility: "ascendant_descendant",
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
      case "ascendant_descendant": return {
        ascendant: true,
        descendant: true,
      };
    }
  }
);

const simpleFilteringQueryAtom = atom<string>(defaultManipulation.simpleFilteringQuery);
const simpleFilterMapsAtom = atom<FilteringMap | null>(
  (get) => {
    const query = get(simpleFilteringQueryAtom);
    const json = get(jsonFlattenedAtom);
    const filteringVisibility = get(filteringVisibilityAtom);

    if (query.length === 0 || !json) { return null; }
    const { items } = json;
    // item ごとに query にマッチしたかどうかを判定する
    const matchedMap: { [k: number]: boolean } = {};
    for (const item of items) {
      if (typeof item.itemKey !== "undefined") {
        const key = item.itemKey.toString().toLowerCase();
        if (key.includes(query)) {
          matchedMap[item.index] = true;
          continue;
        }
      }
      if (item.right.type === "string") {
        const key = item.right.value.toLowerCase();
        if (key.includes(query)) {
          matchedMap[item.index] = true;
        }
      } else if (item.right.type === "number") {
        const key = item.right.value.toString().toLowerCase();
        if (key.includes(query)) {
          matchedMap[item.index] = true;
        }
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
    return itemFrom.rowItems.length === itemTo.rowItems.length;
  });
  const indexTo = itemTo ? itemTo.index : items.length;
  return {
    from: indexFrom, to: indexTo,
  };
};

export const useManipulation = () => {
  const [selectedIndex, setSelectedIndex] = useAtom(selectedIndexAtom);
  const [narrowedRanges, setNarrowedRangesRaw] = useAtom(narrowedRangeAtom);
  const [simpleFilteringQuery, setSimpleFilteringQuery] = useAtom(simpleFilteringQueryAtom);
  const [simpleFilterMaps] = useAtom(simpleFilterMapsAtom);
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

  const clearManipulation = () => {
    setSelectedIndex(defaultManipulation.selectedIndex);
    setNarrowedRangesRaw(defaultManipulation.narrowedRanges);
    setSimpleFilteringQuery(defaultManipulation.simpleFilteringQuery);
  };

  return {
    manipulation: {
      selectedIndex,
      narrowedRanges,
      simpleFilteringQuery,
    },

    setSelectedIndex,
    pushNarrowedRange,
    popNarrowedRange,
    setSimpleFilteringQuery,
    simpleFilterMaps,

    filteringPreference,
    filteringVisibility,
    setFilteringVisibility,

    clearManipulation,
  };
};
