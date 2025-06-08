import { JsonGauge, JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { FlatJsonValueCell } from "./FlatJsonValueCell";
import { useState } from "react";
import { useManipulation } from "@/states/manipulation";
import { FlatJsonLeadingCell } from "./leading/Leading";
import { LineNumberCell } from "./LineNumberCell";
import { useToggleSingle } from "@/states/view";
import { CopyButton } from "../lv3/CopyButton";

const LeadingCells = (props: {
  item: JsonRowItem;
  gauge?: JsonGauge;
  isHovered: boolean;
  isMatched: boolean;
  isNarrowedFrom: boolean;
  manipulationHook: ReturnType<typeof useManipulation>;
  toggleSingleHook: ReturnType<typeof useToggleSingle>;
}) => {
  const {
    item,
    gauge,
    isHovered,
    isMatched,
    isNarrowedFrom,
    toggleSingleHook,
    manipulationHook,
  } = props;
  const {
    rowItems
  } = item;
  const leadingPairs: {
    item?: JsonRowItem;
    nextItem: JsonRowItem;
  }[] = rowItems.map((item, i) => ({
    item,
    nextItem: i + 1 < rowItems.length ? rowItems[i + 1] : item,
  }));
  if (leadingPairs.length === 0) {
    leadingPairs.push({
      nextItem: item,
    });
  }
  return <>{
    leadingPairs.map((pair, i) => {
      const currentItem = pair.item;
      const nextItem = pair.nextItem;
      const isRightmost = i + 1 === leadingPairs.length;
      return <FlatJsonLeadingCell
        key={"cell."+(currentItem?.elementKey ?? "root")}
        item={currentItem}
        gauge={gauge}
        nextItem={nextItem}
        right={isRightmost ? item : undefined}
        index={i}
        typeIndex={rowItems.length > 0 ? i + 1 : i}
        isHovered={isHovered}
        isMatched={isMatched}
        isNarrowedFrom={isNarrowedFrom}
        manipulationHook={manipulationHook}
        toggleSingleHook={toggleSingleHook}
      />
    })
  }</>
}

const CopyValueButton = (props: {
  item: JsonRowItem;
}) => <CopyButton
  alt="この要素をJSONとしてクリップボードにコピーする"
  getSubtext={() => {
    return JSON.stringify(props.item.right.value, null, 2);
  }}
  getToastText={() => `値をクリップボードにコピーしました`}
/>

const CopyKeyPathButton = (props: {
  item: JsonRowItem;
}) => <CopyButton
  alt="この要素のキーをクリップボードにコピーする"
  getSubtext={() => {
    return props.item.elementKey;
  }}
  getToastText={() => `KeyPath ${props.item.elementKey} をクリップボードにコピーしました`}
/>

const ValueMenuCell = (props: {
  item: JsonRowItem;
}) => {
  const vo = props.item.right;
  const showCopyValueButton = vo.type !== "null" && vo.type !== "boolean";
  const showCopyKeyPathButton = true;

  return <div
    className="subtree-menu grow-0 shrink-0 flex flex-row items-center p-1 gap-1 text-sm"
  >
    {showCopyValueButton && <CopyValueButton item={props.item} />}
    {showCopyKeyPathButton && <CopyKeyPathButton item={props.item} />}
    </div>
}

export const FlatJsonRow = (props: {
  item: JsonRowItem;
  manipulationHook: ReturnType<typeof useManipulation>;
  toggleSingleHook: ReturnType<typeof useToggleSingle>;
  gauge?: JsonGauge;
}) => {
  
  const [isHovered, setIsHovered] = useState(false);
  const { manipulation, filteringPreference, filterMaps } = props.manipulationHook;
  const isMatched = !!(filterMaps && filterMaps.matched[props.item.index]);
  const isNarrowedFrom = _.last(manipulation.narrowedRanges)?.from === props.item.index;
  const isWeaken = filteringPreference.resultAppearance === "lightup" && !!filterMaps && !isMatched;
  const {
    item,
    gauge,
    manipulationHook,
    toggleSingleHook,
  } = props;
  const {
    right,
    elementKey,
  } = item;
  const isLeaf = right.type === "string" || right.type === "number" || right.type === "boolean" || right.type === "null";
  const backgroundClass = (isMatched && filteringPreference.resultAppearance !== "just")
    ? "matched-row"
    : isNarrowedFrom
      ? "narrowed-from-row"
      : isHovered
        ? "secondary-background"
        : "";
  return (<div
    className={
      `h-[2em] flex flex-row items-stretch gap-0 ${backgroundClass} ${isWeaken ? "weaken-row" : ""}`
    }
    onMouseOver={() => setIsHovered(true)}
    onMouseOut={() => setIsHovered(false)}
  >
    <LineNumberCell item={item} />

    <LeadingCells
      item={item}
      gauge={gauge}
      isHovered={isHovered}
      isMatched={isMatched}
      isNarrowedFrom={isNarrowedFrom}
      manipulationHook={manipulationHook}
      toggleSingleHook={toggleSingleHook}
    />

    <FlatJsonValueCell
      vo={right}
      elementKey={elementKey}
      matched={isMatched}
    />

    {isLeaf && isHovered && <ValueMenuCell item={item} />}
  </div>)
}
