import { useJSON } from "@/states";
import { InlineIcon } from "../lv1/InlineIcon";
import _ from "lodash";
import { useCallback } from "react";
import { useManipulation } from "@/states/manipulation";
import { FaSearch } from "react-icons/fa";
import { useAdvancedQuery } from "@/libs/advanced_query";
import { PreferencePanel } from "./FilterPreferencePanel";


const TextField = () => {
  const {
    setAdvancedFilteringQuery: setQueryString,
  } = useAdvancedQuery();
  const reflectQuery = useCallback(
    _.debounce((value: string) => {
      setQueryString(prev => {
        const next = value.trim();
        return next === prev ? prev : next;
      });
    }, 100), [setQueryString]
  );

  return <div>
    <input
      type="text"
      className="p-1 bg-transparent border-[1px] outline-0 w-[28em]"
      placeholder="Filter Key or Value"
      onChange={(e) => {
        reflectQuery(e.currentTarget.value);
      }}
    />
  </div>
};

const HitCounter = () => {
  const { filterMaps } = useManipulation();
  if (!filterMaps) { return null }
  const hitCount = _.size(filterMaps.matched);

  return <p className={`filter-matched-items ${hitCount > 0 ? "" : "no-hit"}`}>
    {hitCount}
    <span className="text-sm">items</span>
  </p>
}

export const AdvancedFilterPanel = () => {
  const { flatJsons } = useJSON();

  const items = flatJsons?.items;
  if (!items) { return null; }

  return <div
    className="p-1 gap-1 flex flex-row items-center"
  >
    <InlineIcon i={<FaSearch />} />

    <TextField />

    <HitCounter />

    <PreferencePanel />
  </div>;
}
