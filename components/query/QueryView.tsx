import _ from "lodash";
import { MultipleButtons } from "../lv1/MultipleButtons";
import { useManipulation } from "@/states/manipulation";
import { PreferencePanel } from "../lv2/FilterPreferencePanel";
import { SimpleFilterCard } from "./SimpleFilterCard";
import { AdvancedFilterCard } from "./AdvancedFilterCard";
import { InlineIcon } from "../lv1/InlineIcon";
import { FaSearch } from "react-icons/fa";

const ModePanel = () => {
  const { filteringPreference, setFilteringMode } = useManipulation();

  return <MultipleButtons
    currentKey={filteringPreference.mode}
    items={[
      {
        key: "simple",
        title: "Simple",
        hint: "キー・値に対する部分一致検索",
      },
      {
        key: "advanced",
        title: "Advanced",
        hint: "JSONの構造自体に対する検索",
      },
    ]}
    onClick={(item) => setFilteringMode(item.key)}
  />
};

export const QueryView = () => {
  const { filteringPreference } = useManipulation();

  const FilterCard = filteringPreference.mode === "simple"
    ? SimpleFilterCard
    : AdvancedFilterCard;

  return <div
    className="query-view shrink grow flex flex-col gap-2 overflow-hidden"
  >
    
    <h2
      className="color-inverted px-2 py-1 flex flex-row gap-1 items-center font-bold"
    >
      <p>Filter</p>
      <InlineIcon i={<FaSearch />} />
    </h2>

    <div
      className="px-2"
    >
      <div
        className="flex flex-row justify-between items-center"
      >
        <h3>
          Mode
        </h3>
        <div>
          <ModePanel />
        </div>
      </div>
    </div>

    <div
      className="px-2"
    >
      <div
        className="flex flex-col items-start"
      >
        <h3>
          Result Appearance
        </h3>
        <div>
          <PreferencePanel />
        </div>
      </div>
    </div>

    <div
      className="px-2 shrink grow"
    >
      <FilterCard />
    </div>

  </div>;
};

