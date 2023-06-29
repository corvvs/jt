import _ from "lodash";
import { useId } from "react";
import { useManipulation } from "@/states/manipulation";
import { QueryDebugView } from "./QueryDebugView";

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
        <label className="flippable-secondary p-1 cursor-pointer" htmlFor={showDebugId}>詳細を表示(特に役には立たない)</label>
    </div>

    {
      filteringPreference.showAdvancedDebug ? <QueryDebugView /> : null
    }
  </div>;
}
