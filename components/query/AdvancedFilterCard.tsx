import _ from "lodash";
import { useId } from "react";
import { useManipulation } from "@/states/manipulation";
import { QueryDebugView } from "./QueryDebugView";

export const AdvancedFilterCard = () => {
  const { filteringPreference, setFilteringBooleanPreference } = useManipulation();
  const showDebugId = useId();

  return <div
    className="gap-1 flex flex-col items-stretch"
  >

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
