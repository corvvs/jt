import { useAtom } from "jotai";
import _ from "lodash";
import { defaultNarrowedRange, useNarrowing } from "./manipulation/narrowing";
import { AppearanceDescription, FilteringResultAppearanceOption, ModeDescription, defaultFilteringQuery, filterMapsAtom, filteringResultAppearanceAtom, useQuery } from "./manipulation/query";
import { saveDefaultSearchAppearance, saveDefaultSearchMode } from "./search_mode";

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
    if (prev.resultAppearance !== v) {
      saveDefaultSearchAppearance(v);
    }
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

/**
 * 生成したクエリを検索に適用する (プロファイルのファセット / 行のキーメニューで共用).
 * advanced モードに切り替えてクエリをセットし, 検索パネルを開く。
 * すでに同じクエリが入っているなら解除 (クエリを空にする)。
 *
 * hook を引数で受けるのは, すでに useManipulation を props で受けている
 * 呼び出し元 (行のキーメニュー) に購読をもう1つ張らせないため。
 */
export const applyGeneratedQuery = (
  hook: ReturnType<typeof useManipulation>,
  query: string,
  isActive: boolean,
) => {
  if (isActive) {
    hook.setFilteringQuery("");
    return;
  }
  hook.setFilteringMode("advanced");
  hook.setFilteringQuery(query);
  hook.setFilteringBooleanPreference("showPanel", true);
};

/**
 * applyGeneratedQuery の, 自前で useManipulation を張る版 (プロファイルパネル用).
 */
export const useQueryApplication = () => {
  const hook = useManipulation();
  return {
    filteringQuery: hook.manipulation.filteringQuery,
    applyQuery: (query: string, isActive: boolean) => applyGeneratedQuery(hook, query, isActive),
  } as const;
};
