import { useAtom } from "jotai";
import _ from "lodash";
import { defaultNarrowedRange, useNarrowing } from "./manipulation/narrowing";
import { AppearanceDescription, FilteringResultAppearanceOption, ModeDescription, defaultFilteringQuery, filterMapsAtom, filteringResultAppearanceAtom, useQuery } from "./manipulation/query";
import { saveDefaultSearchMode } from "./search_mode";

type Manipulation = {
  /**
   * ナローイングスタック
   */
  narrowedRanges: typeof defaultNarrowedRange;

  /**
   * 検索クエリ文字列
   */
  filteringQuery: typeof defaultFilteringQuery;
};

const defaultManipulation: Manipulation = {
  narrowedRanges: defaultNarrowedRange,
  filteringQuery: defaultFilteringQuery,
};

export const useManipulation = () => {
  const {
    narrowedRanges,
    setNarrowedRangesRaw,
    pushNarrowedRange,
    popNarrowedRange,
  } = useNarrowing();
  const {
    filteringPreference,
    setFilteringPreference,
    filteringQuery,
    setFilteringQuery,
    filterInputFocused,
  } = useQuery();
  const [filterMaps] = useAtom(filterMapsAtom);

  const setFilteringResultAppearance = (v: FilteringResultAppearanceOption) => setFilteringPreference(prev => {
    const next = _.cloneDeep(prev);
    next.resultAppearance = v;
    return next;
  });
  const setFilteringMode = (mode: "simple" | "advanced") => setFilteringPreference(prev => {
    const next = _.cloneDeep(prev);
    next.mode = mode;
    if (prev.mode !== mode) {
      saveDefaultSearchMode(mode);
    }
    return next;
  });
  const setFilteringBooleanPreference = (key: "showPanel" | "showAdvancedDebug", value: boolean) => {
    setFilteringPreference(prev => {
      const next = _.cloneDeep(prev);
      next[key] = value
      return  next;
    });
  };

  const clearManipulation = () => {
    setNarrowedRangesRaw(defaultManipulation.narrowedRanges);
    setFilteringQuery(defaultManipulation.filteringQuery);
  };

  return {
    manipulation: {
      narrowedRanges,
      filteringQuery,
    },

    pushNarrowedRange,
    popNarrowedRange,
    setFilteringQuery,
    filterMaps,

    filteringPreference,
    setFilteringResultAppearance,
    setFilteringMode,
    setFilteringBooleanPreference,
    queryModeDescription: ModeDescription[filteringPreference.mode],
    appearanceDescription: AppearanceDescription[filteringPreference.resultAppearance],
    filterInputFocused,

    clearManipulation,
  };
};
