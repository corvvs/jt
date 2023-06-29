import { useJSON } from "@/states";
import _ from "lodash";
import { useCallback } from "react";
import { useManipulation } from "@/states/manipulation";

const TextField = () => {
  const { manipulation, setSimpleFilteringQuery } = useManipulation();
  const reflectQuery = useCallback(
    _.debounce((value: string) => {
      setSimpleFilteringQuery(prev => {
        return value === prev ? prev : value;
      });
    }, 16), []
  );

  return <div>
    <input
      type="text"
      className="p-1 bg-transparent	border-[1px] outline-0 w-full"
      placeholder="Filter Key or Value"
      value={manipulation.simpleFilteringQuery}
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

export const SimpleFilterCard = () => {
  const { flatJsons } = useJSON();

  const items = flatJsons?.items;
  if (!items) { return null; }

  return <div
    className="gap-1 flex flex-col items-stretch"
  >

    <TextField />
    <HitCounter />
  </div>;
}
