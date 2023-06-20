import { JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { FlatJsonValueCell } from "./FlatJsonValueCell";
import { useState } from "react";
import { useManipulation } from "@/states/manipulation";
import { FlatJsonLeadingCell } from "./leading/Leading";

const LineNumberCell = (props: {
  item: JsonRowItem;
}) => {
  const { manipulation, setManipulation } = useManipulation();
  const itemIndex = props.item.index;
  const isSelected = manipulation.selectedIndex === itemIndex;
  return <div
    className={
      'w-[4em] grow-0 shrink-0 flex flex-row justify-end items-center p-1 line-number text-sm cursor-pointer line-number-cell'
    }
    onClick={() => {
      if (isSelected) {
        setManipulation((prev) => ({
          ...prev,
          selectedIndex: null,
        }));
      } else {
        setManipulation((prev) => ({
          ...prev,
          selectedIndex: itemIndex,
        }));
      }
    }}
  >
    <div>{itemIndex}</div>
  </div>
}

const LeadingCells = (props: {
  item: JsonRowItem;
  isHovered: boolean;
}) => {
  const {
    item,
    isHovered,
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
        nextItem={nextItem}
        right={isRightmost ? item : undefined}
        index={i}
        typeIndex={rowItems.length > 0 ? i + 1 : i}
        isHovered={isHovered}
      />
    })
  }</>
}

export const FlatJsonRow = (props: {
  item: JsonRowItem;
}) => {
  
  const [isHovered, setIsHovered] = useState(false);
  const { manipulation } = useManipulation();
  const isSelected = manipulation.selectedIndex === props.item.index;
  const item = props.item;
  const {
    right,
    rowItems,
    elementKey,
  } = item;
  const backgroundClass = isSelected ? "selected-row" : isHovered ? "secondary-background" : "";

  return (<div
    className={
      `h-[2em] flex flex-row items-stretch gap-0 ${backgroundClass}`
    }
    onMouseOver={() => setIsHovered(true)}
    onMouseOut={() => setIsHovered(false)}
  >
    <LineNumberCell item={item} />

    <LeadingCells item={item} isHovered={isHovered} />

    <FlatJsonValueCell
      vo={right}
      elementKey={elementKey}
      index={rowItems.length}
    />
  </div>)
}
