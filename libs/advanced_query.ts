import { filteringPreferenceAtom, filteringQueryAtom } from "@/states/manipulation";
import { atom, useAtom } from "jotai";
import _ from "lodash";
import { QuerySyntaxError } from "./advanced_query/QuerySyntaxError";
import { tokenizeQuery } from "./advanced_query/tokenizer";
import { structurizeQuery } from "./advanced_query/parser";
import { JsonRowItem } from "./jetson";
import { matchByQuery } from "./advanced_query/matcher";

const parsedAdvancedQueryAtom = atom(
  (get) => {
    if (get(filteringPreferenceAtom).mode !== "advanced") {
      return null; 
    }
    const query = get(filteringQueryAtom).trim();
    return parseQuery(query);
  }
);

const parseQuery = (query: string) => {
  // トークナイズ
  const tokens = tokenizeQuery(query);
  const originalTokens = [...tokens];
  // 検索構造体の構成
  try {
    const structure = structurizeQuery(tokens);
    return {
      tokens: originalTokens,
      structure,
    };
  } catch (error) {
    if (error instanceof QuerySyntaxError) {
      return {
        tokens: originalTokens,
        syntaxError: error,
      };
    }
    throw error;
  }
};

export const advancedMatcherAtom = atom(
  (get) => {
    const parsedQuery = get(parsedAdvancedQueryAtom);
    if (!parsedQuery) {
      return { matcher: null };
    }
    if (parsedQuery.syntaxError) {
      return { matcher: null };
    }
    const q = parsedQuery.structure ? _.first(parsedQuery.structure) : undefined;
    if (!q) {
      return { matcher: null };
    }
    if (q.type === "GroupedQuery" || q.type === "Query") {
      return { matcher: (item: JsonRowItem) => matchByQuery(item, q) };
    }
    return { matcher: () => true };
  }
);

export const useAdvancedQuery = () => {
  const [advancedFilteringQuery, setAdvancedFilteringQuery] = useAtom(filteringQueryAtom);
  const [parsedQuery] = useAtom(parsedAdvancedQueryAtom);
  const [{ matcher }] = useAtom(advancedMatcherAtom);

  return {
    advancedFilteringQuery,
    setAdvancedFilteringQuery,
    parsedQuery,
    advancedMatcher: matcher,
  };
};
