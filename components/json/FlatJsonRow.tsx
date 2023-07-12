import { JsonGauge, JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { FlatJsonValueCell } from "./FlatJsonValueCell";
import { useState } from "react";
import { useManipulation } from "@/states/manipulation";
import { FlatJsonLeadingCell } from "./leading/Leading";
import { LineNumberCell } from "./LineNumberCell";
import { useToggleSingle } from "@/states/view";

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
  const backgroundClass = (isMatched && filteringPreference.resultAppearance !== "just")
    ? "matched-row"
    : isNarrowedFrom
      ? "narrowed-from-row"
      : isHovered
        ? "secondary-background"
        : "";

  return (<div
    className={
      `h-[2em] flex flex-row items-stretch gap-0 ${backgroundClass}`
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
  </div>)
}
