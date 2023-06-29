import { useManipulation } from "@/states/manipulation";
import _ from "lodash";
import { MultipleButtons } from "../lv1/MultipleButtons";

export const PreferencePanel = () => {
  const { filteringPreference, setFilteringVisibility } = useManipulation();

  return <MultipleButtons
    currentKey={filteringPreference.visibility}
    items={[
      {
        key: "ascendant_descendant",
        title: "Related",
        hint: "ヒットした項目とその祖先および子孫の項目を表示する",
      },
      {
        key: "ascendant",
        title: "Ascendant",
        hint: "ヒットした項目とその祖先の項目を表示する",
      },
      {
        key: "descendant",
        title: "Descendant",
        hint: "ヒットした項目とその子孫の項目を表示する",
      },
      {
        key: "just",
        title: "Matched",
        hint: "ヒットした項目のみを表示する",
      },
    ]}
    onClick={(item) => {
      setFilteringVisibility(item.key);
    }}
  />
};

