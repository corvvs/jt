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
    items
  </p>
}

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
  </div>;
}
