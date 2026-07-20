import { atom, useAtom } from "jotai";
import _ from "lodash";
import { JsonRowItem } from "./jetson";
import { matchByQuery } from "./advanced_query/matcher";
import { parseQuery } from "./advanced_query/parseQuery";
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
