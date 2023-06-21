import { useJSON } from "@/states";
import { InlineIcon } from "../lv1/InlineIcon";
import { VscFilter } from 'react-icons/vsc';
import _ from "lodash";
import { useCallback } from "react";
import { useManipulation } from "@/states/manipulation";

const TextField = () => {
  const { setSimpleFilteringQuery } = useManipulation();
  const reflectQuery = useCallback(
    _.debounce((value: string) => {
      setSimpleFilteringQuery(prev => {
        const next = value.trim().toLowerCase();
        return next === prev ? prev : next;
      });
    }, 33), []
  );

  return <div>
    <input
      type="text"
      className="p-1 bg-transparent	border-[1px] outline-0"
      placeholder="Filter Key or Value"
      onChange={(e) => {
        reflectQuery(e.currentTarget.value);
      }}
    />
  </div>
};

const HitCounter = () => {
  const { simpleFilterMaps } = useManipulation();
  if (!simpleFilterMaps) { return null }
  const hitCount = _.size(simpleFilterMaps.matched);

  return <p className={`filter-matched-items ${hitCount > 0 ? "" : "no-hit"}`}>
    {hitCount}
    <span className="text-sm">items</span>
  </p>
}

type MultipleButtonItem<T> = {
  key: T;
  title: string;
  hint?: string;
};

type MultipleButtonProps<T> = {
  items: MultipleButtonItem<T>[];
  currentKey?: T;
  onClick: (item: MultipleButtonItem<T>) => void;
};

function MultipleButtons<T extends string>({
  items,
  currentKey,
  onClick,
}: MultipleButtonProps<T>) {
  const buttons = items.map(item => {
    const isActive = currentKey === item.key;
    return <button
      key={item.key}
      className={`multiple-buttons-button ${isActive ? "active" : ""}`}
      title={item.hint}
      onClick={() => onClick(item)}
    >
      {item.title}
    </button>
  });

  return <div className="multiple-buttons">{ buttons }</div>;
}

const PreferencePanel = () => {
  const { filteringPreference, setFilteringVisibility } = useManipulation();
  const { simpleFilterMaps } = useManipulation();
  if (!simpleFilterMaps) { return null }
  const hitCount = _.size(simpleFilterMaps.matched);
  if (hitCount === 0) { return null; }

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

export const SimpleFilterPanel = () => {
  const { flatJsons } = useJSON();

  const items = flatJsons?.items;
  if (!items) { return null; }

  return <div
    className="p-1 gap-1 flex flex-row items-center"
  >
    <InlineIcon i={<VscFilter />} />

    <TextField />

    <HitCounter />

    <PreferencePanel />
  </div>;
}
