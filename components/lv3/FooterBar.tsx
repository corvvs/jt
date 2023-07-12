import { JsonStats } from "@/libs/jetson";
import { useJSON } from "@/states";
import { useVisibleItems } from "@/states/json";
import _ from "lodash";
import React, { MutableRefObject } from "react";

const MainLine = (props: {
  stats: JsonStats;
  itemViewRef: MutableRefObject<any>;
}) => {
  const { document, flatJsons } = useJSON();
  const visibles = useVisibleItems();
  if (!flatJsons || !visibles) { return null; }

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

    <div
      className="shrink grow flex flex-row justify-end items-center"
    >
      {
        document && document.name
          ? <div
            className="document-name flex flex-row items-center px-2"
          >
            <p>Document Name:</p>
            <p>{ document.name }</p>
          </div>
          : null
      }
    </div>
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

