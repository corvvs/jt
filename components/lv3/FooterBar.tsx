import { JsonStats } from "@/libs/jetson";
import { useJSON } from "@/states";
import { useManipulation } from "@/states/manipulation";
import _ from "lodash";
import { MutableRefObject } from "react";

export const JsonStatsLine = (props: {
  stats: JsonStats;
  itemViewRef: MutableRefObject<any>;
}) => {
  const { manipulation } = useManipulation();
  const { flatJsons } = useJSON();
  if (!flatJsons) { return null; }
  const narrowingItemFrom = _.isFinite(manipulation.narrowedRange?.from) ? flatJsons.items[manipulation.narrowedRange!.from] : null;

  return (<>
    <p className="stats-item">
      <span>Lines:</span>
      <span className="stats-value">{props.stats.item_count}</span>
    </p>

    <p className="stats-item">
      <span>Depth:</span>
      <span className="stats-value">{props.stats.max_depth}</span>
    </p>

    <p className="stats-item">
      <span>Characters:</span>
      <span className="stats-value">{props.stats.char_count}</span>
    </p>

    {
      _.isFinite(manipulation.selectedIndex)
        ? <p className="stats-item">
            <span>Selected Line:</span>
            <span className="stats-value">{manipulation.selectedIndex}</span>
          </p>
        : null
    }

    {
      narrowingItemFrom
        ? <p
          className="stats-item narrowing-status cursor-pointer"
          onClick={() => {
            const itemView = props.itemViewRef.current
            if (!itemView || !manipulation.narrowedRange) { return; }
            itemView.scrollToItem(0);
          }}
        >
            <span>Narrowing:</span>
            <span className="stats-value">{narrowingItemFrom.lineNumber}</span>
          </p>
        : null
    }
  </>)
};

