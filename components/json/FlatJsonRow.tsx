import { JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { ActualIconForType, FlatJsonValueCell } from "./FlatJsonValueCell";
import { FixedSizeList } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import { InlineIcon } from "../lv1/InlineIcon";
import { useState } from "react";


const RightmostKeyCell = (props: {
  index: number;
  right: JsonRowItem;
}) => {
  const depth = props.index % 5;
  switch (typeof props.right.itemKey) {
    case "string": {
      // キーを表示する
      return <div
        className={`w-[6em] grow shrink p-1 item-key depth-${depth} text-base text-ellipsis whitespace-nowrap break-keep overflow-hidden`}
        style={{ overflow: "normal" }}
        title={props.right.itemKey}
      >{props.right.itemKey}</div>
    }
    case "number": {
      // インデックスを表示する
      return <div
        className={`w-[6em] grow shrink p-1 item-index depth-${depth} text-base text-ellipsis whitespace-nowrap break-keep overflow-hidden`}
        style={{ overflow: "normal" }}
        title={`${props.right.itemKey}`}
      >[{props.right.itemKey}]</div>
    }
  }
  return null;
}

const RightmostTypeCell = (props: {
  index: number;
  right: JsonRowItem;
}) => {
  const depth2 = props.index % 5;
  switch (props.right.right.type) {
    case "map": {
      return <div
        className={`grow-0 shrink-0 json-structure item-key item-type depth-${depth2} w-[6em] p-1 text-base text-center`}
      >
        <InlineIcon i={<ActualIconForType vo={props.right.right} />} />
        {props.right.childs?.length ?? 0}
      </div>
    }
    case "array": {
      return <div
        className={`grow-0 shrink-0 json-structure item-index item-type depth-${depth2} w-[6em] p-1 text-base text-center`}
      >
        <InlineIcon i={<ActualIconForType vo={props.right.right} />} />
        {props.right.childs?.length ?? 0}
      </div>
    }
  }
  return null;
}

/**
 * その行の本来のアイテムの左側に表示されるセル
 */
const FlatJsonLeadingCell = (props: {
  item?: JsonRowItem;
  nextItem: JsonRowItem;
  index: number;
  typeIndex: number;
  isHovered: boolean;
  /**
   * その行に本来表示したいアイテム
   * 「最も右のLeadingCell」にのみ与えられる
   */
  right?: JsonRowItem;
}) => {

  const depth = props.index % 5;
  if (!props.right) {
    // 最も右のLeadingCell ではない場合
    return <div
      className={`w-[6em] grow-0 shrink-0 item-index depth-${depth} text-base secondary-foreground`}
    >
      {props.isHovered ? <RightmostKeyCell index={props.index} right={props.nextItem} /> : null}
    </div>
  }

  // 最も右のLeadingCell である場合
  if (props.right.right.type === "array" || props.right.right.type === "map") {
    // 本来のitemが配列またはマップ
    // -> 本来のitemの添字またはキーを表示する
    // -> 続けて, 本来のitemの型と要素数を表示する
    return <div
      className="w-[12em] grow-0 shrink-0 flex flex-row"
      >
      <RightmostKeyCell index={props.index} right={props.right} />
      <RightmostTypeCell index={props.typeIndex} right={props.right} />
    </div>
  } else {
    return <div
      className="w-[6em] flex flex-row"
      >
      <RightmostKeyCell index={props.index} right={props.right} />
    </div>
  }
}

const LineNumberCell = (props: {
  index: number;
}) => {
  return <div
    className="w-[4em] grow-0 shrink-0 flex flex-row justify-end items-center p-1 line-number text-sm"
  >
    <div>{props.index + 1}</div>
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
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const item = props.item;
  const {
    right,
    rowItems,
    elementKey,
    childs,
  } = item;

  return (<div
    className={`h-[2em] flex flex-row items-stretch gap-0 ${isHovered ? "secondary-background" : ""}`}
    onMouseOver={() => setIsHovered(true)}
    onMouseOut={() => setIsHovered(false)}
  >
    <LineNumberCell index={props.index} />

    <LeadingCells item={item} isHovered={isHovered} />

    <FlatJsonValueCell
      vo={right}
      elementKey={elementKey}
      index={rowItems.length}
    />
  </div>)
}

interface VirtualScrollProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  itemSize: number;
}

export function VirtualScroll<T>({ data, renderItem, itemSize }: VirtualScrollProps<T>) {
  const Row = ({ index, style }: any) => {
    return (
      <div style={style}>
        {renderItem(data[index], index)}
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeList
          height={height}
          width={width}
          itemCount={data.length}
          itemSize={itemSize}
        >
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
}
