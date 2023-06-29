import { useJSON } from "@/states";
import _ from "lodash";
import { useManipulation } from "@/states/manipulation";

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

    <HitCounter />
  </div>;
}
