import { JsonGauge, JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { FlatJsonValueCell } from "./FlatJsonValueCell";
import { useState } from "react";
import { useManipulation } from "@/states/manipulation";
import { FlatJsonLeadingCell } from "./leading/Leading";
import { LineNumberCell } from "./LineNumberCell";

const LeadingCells = (props: {
  item: JsonRowItem;
  gauge?: JsonGauge;
  isHovered: boolean;
  isMatched: boolean;
}) => {
  const {
    item,
    gauge,
    isHovered,
    isMatched,
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
      />
    })
  }</>
}

export const FlatJsonRow = (props: {
  item: JsonRowItem;
  gauge?: JsonGauge;
}) => {
  
  const [isHovered, setIsHovered] = useState(false);
  const { manipulation, simpleFilterMaps } = useManipulation();
  const isMatched = !!(simpleFilterMaps && simpleFilterMaps.matched[props.item.index]);
  const isSelected = manipulation.selectedIndex === props.item.index;
  const isNarrowedFrom = _.last(manipulation.narrowedRanges)?.from === props.item.index;
  const {
    item,
    gauge,
  } = props;
  const {
    right,
    rowItems,
    elementKey,
  } = item;
  const backgroundClass = isMatched
    ? "matched-row"
    : isNarrowedFrom
      ? "narrowed-from-row"
      : isSelected
        ? "selected-row"
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
    />

    <FlatJsonValueCell
      vo={right}
      elementKey={elementKey}
      matched={isMatched}
    />
  </div>)
}
