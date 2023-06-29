import { useJSON } from "@/states";
import _ from "lodash";
import { useCallback, useEffect, useId, useRef } from "react";
import { useManipulation } from "@/states/manipulation";
import { useAdvancedQuery } from "@/libs/advanced_query";
import { QueryDebugView } from "./QueryDebugView";


const TextField = () => {
  const {
    advancedFilteringQuery,
    setAdvancedFilteringQuery: setQueryString,
  } = useAdvancedQuery();
  const inputRef = useRef<any>();
  const reflectQuery = useCallback(
    _.debounce((value: string) => {
      setQueryString(prev => {
        return value === prev ? prev : value;
      });
    }, 99), [setQueryString]
  );

  useEffect(() => {
    inputRef.current.value = advancedFilteringQuery;
}, []);

  return <div>
    <input
      type="text"
      ref={inputRef}
      className="p-1 bg-transparent border-[1px] outline-0 w-full"
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

export const AdvancedFilterCard = () => {
  const { filteringPreference, setFilteringBooleanPreference } = useManipulation();
  const showDebugId = useId();

  return <div
    className="gap-1 flex flex-col items-stretch"
  >
    <TextField />
    <HitCounter />

    <div
      className="flex flex-row justify-end items-center gap-1"
    >
      <input
        type="checkbox"
        id={showDebugId}
        checked={filteringPreference.showAdvancedDebug}
        onChange={() => setFilteringBooleanPreference("showAdvancedDebug", !filteringPreference.showAdvancedDebug)}
      />
        <label className="flippable-secondary p-1 cursor-pointer" htmlFor={showDebugId}>Show Detail</label>
    </div>

    {
      filteringPreference.showAdvancedDebug ? <QueryDebugView /> : null
    }
  </div>;
}
