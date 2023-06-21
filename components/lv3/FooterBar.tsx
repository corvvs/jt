import { JsonStats } from "@/libs/jetson";
import { useJSON } from "@/states";
import { useVisibleItems } from "@/states/json";
import { useManipulation } from "@/states/manipulation";
import _ from "lodash";
import { MutableRefObject } from "react";

export const JsonStatsLine = (props: {
  stats: JsonStats;
  itemViewRef: MutableRefObject<any>;
}) => {
  const { manipulation } = useManipulation();
  const { flatJsons } = useJSON();
  const visibleItems = useVisibleItems();
  if (!flatJsons) { return null; }
  const items = flatJsons.items;
  const selectedItem = _.isFinite(manipulation.selectedIndex) ? items[manipulation.selectedIndex!] : null;
  const selectedIndexInVisibles = _.isFinite(manipulation.selectedIndex) ? visibleItems.findIndex(item => item.index === manipulation.selectedIndex) : null;
  const narrowingItemFrom = _.isFinite(manipulation.narrowedRange?.from) ? items[manipulation.narrowedRange!.from] : null;

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
      selectedItem
        ? <p
            className="stats-item selecting-status cursor-pointer"
            onClick={() => {
              const itemView = props.itemViewRef.current
              if (!itemView || !_.isFinite(selectedIndexInVisibles)) { return; }
              itemView.scrollToItem(selectedIndexInVisibles);
            }}
          >
            <span>Selecting Line:</span>
            <span className="stats-value">{selectedItem.elementKey}</span>
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
            <span className="stats-value">{narrowingItemFrom.elementKey}</span>
          </p>
        : null
    }
  </>)
};

