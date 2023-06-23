import { JsonStats } from "@/libs/jetson";
import { useJSON } from "@/states";
import { useVisibleItems } from "@/states/json";
import { useManipulation } from "@/states/manipulation";
import _ from "lodash";
import React, { MutableRefObject } from "react";
import { FaChevronRight } from "react-icons/fa";

const NarrowingLine = (props: {
  stats: JsonStats;
  itemViewRef: MutableRefObject<any>;
}) => {
  const { manipulation, popNarrowedRange } = useManipulation();
  const { flatJsons } = useJSON();
  if (!flatJsons) { return null; }
  if (manipulation.narrowedRanges.length === 0) { return null; }
  const allItems = flatJsons.items;

  let lastKeyPath = "";
  const narrowingItems = manipulation.narrowedRanges.map(range => {
    const item = allItems[range.from];
    const keyPath = (() => {
      if (item.elementKey.startsWith(lastKeyPath)) {
        return item.elementKey.substring(lastKeyPath ? lastKeyPath.length + 1 : 0);
      } else {
        // 本来はおかしい
        return item.elementKey;
      }
    })();
    lastKeyPath = item.elementKey;
    return {
      item,
      keyPath,
      range,
    };
  });

  return (<div
    className="narrowing-line shrink-0 grow-0 flex flex-row gap-1 text-sm stats items-center"
  >
    <p className="line-title shrink-0 grow-0">Narrowing</p>

    <p
      className="stats-item narrowing-status shrink-0 grow-0 cursor-pointer"
      onClick={() => popNarrowedRange()}
    >
      <span className="stats-value">(root)</span>
    </p>

    {
      narrowingItems.map((narrowingItem, i) => {
        return <React.Fragment key={narrowingItem.item.elementKey}>
          <p><FaChevronRight /></p>
          <p
            className="stats-item narrowing-status shrink-0 grow-0 cursor-pointer"
            onClick={() => {
              const itemView = props.itemViewRef.current
              if (!itemView) { return; }
              if (i + 1 === narrowingItems.length) {
                // ナローイングスタックの末尾 -> ただスクロールする
                itemView.scrollToItem(0);
              } else {
                // 末尾でない -> クリックした要素までスタックをpopする
                popNarrowedRange(i);
              }
            }}
          >
            <span className="stats-value">{narrowingItem.keyPath}</span>
          </p>
        </React.Fragment>;
      })
    }
  </div>)
}

const BaseLine = (props: {
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
    <NarrowingLine stats={stats} itemViewRef={props.itemViewRef} />
    <BaseLine stats={stats} itemViewRef={props.itemViewRef} />
  </>;
};

