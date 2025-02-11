import { useManipulation } from "@/states/manipulation";
import _ from "lodash";
import { MultipleButtons } from "../lv1/MultipleButtons";
import { AppearanceDescription } from "@/states/manipulation/query";

export const FilteringResultAppearancePanel = () => {
  const { filteringPreference, setFilteringResultAppearance } = useManipulation();

  return <MultipleButtons
    currentKey={filteringPreference.resultAppearance}
    items={[
      {
        key: "ascendant_descendant",
        title: "Related",
        hint: AppearanceDescription["ascendant_descendant"],
      },
      {
        key: "ascendant",
        title: "Asc",
        hint: AppearanceDescription["ascendant"],
      },
      {
        key: "descendant",
        title: "Desc",
        hint: AppearanceDescription["descendant"],
      },
      {
        key: "just",
        title: "Only",
        hint: AppearanceDescription["just"],
      },
      {
        key: "lightup",
        title: "LightUp",
        hint: AppearanceDescription["lightup"],
      },
    ]}
    onClick={(item) => {
      setFilteringResultAppearance(item.key);
    }}
  />
};

