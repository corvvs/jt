import { atom, useAtom } from "jotai";
import { parseQuery } from "./advanced_query/parseQuery";
import { matcherOfParsedQuery } from "./query_matcher";
import { filteringPreferenceAtom, filteringQueryAtom } from "@/states/manipulation/query";

const parsedAdvancedQueryAtom = atom(
  (get) => {
    if (get(filteringPreferenceAtom).mode !== "advanced") {
      return null; 
    }
    const query = get(filteringQueryAtom).trim();
    return parseQuery(query);
  }
);

export const advancedMatcherAtom = atom(
  (get) => {
    const parsedQuery = get(parsedAdvancedQueryAtom);
    if (!parsedQuery) {
      return { matcher: null };
    }
    return { matcher: matcherOfParsedQuery(parsedQuery) };
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
