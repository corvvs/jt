import { JsonStats } from "@/libs/jetson";
import { useJSON } from "@/states";
import { useVisibleItems } from "@/states/json";
import { useManipulation } from "@/states/manipulation";
import _ from "lodash";
import React, { MutableRefObject } from "react";

const MainLine = (props: {
  stats: JsonStats;
  itemViewRef: MutableRefObject<any>;
}) => {
  const { manipulation } = useManipulation();
  const { flatJsons } = useJSON();
  const visibles = useVisibleItems();
  if (!flatJsons || !visibles) { return null; }
  const allItems = flatJsons.items;
  const { visibleItems } = visibles;
  const selectedItem = _.isFinite(manipulation.selectedIndex) ? allItems[manipulation.selectedIndex!] : null;
  const selectedIndexInVisibles = _.isFinite(manipulation.selectedIndex) ? visibleItems.findIndex(item => item.index === manipulation.selectedIndex) : null;

  return (<div
    className="shrink-0 grow-0 flex flex-row gap-4 px-2 py-1 text-sm stats items-center"
  >
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
  </div>);
}

export const FooterBar = (props: {
  itemViewRef: MutableRefObject<any>;
}) => {
  const { flatJsons }  = useJSON();
  if (!flatJsons) { return null; }
  const {
    stats,
  } = flatJsons;

  return <>
    <MainLine stats={stats} itemViewRef={props.itemViewRef} />
  </>;
};

