import { JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { ValueCell } from "./ValueCell";
import { FixedSizeList } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';

const FlatJsonUpCell = (props: {
  item: JsonRowItem;
  index: number;
  right?: JsonRowItem;
}) => {

  const depth = props.index % 5;
  switch (typeof props.right?.itemKey) {
    case "string": {
      // キーを表示する
      return <div
        className={`w-[16em] p-1 grow-0 shrink-0 item-key depth-${depth} text-base text-ellipsis whitespace-nowrap overflow-hidden`}
      >{props.right.itemKey}</div>
    }
    case "number": {
      // インデックスを表示する
      return <div
        className={`w-[16em] p-1 grow-0 shrink-0 item-index depth-${depth} text-base text-ellipsis whitespace-nowrap overflow-hidden`}
      >#{props.right.itemKey}</div>
    }
  }
  // 何も出さなくてよい
  return <div
    className={`w-[5em] grow-0 shrink-0 item-index depth-${depth} text-base`}
  />
}

interface VirtualScrollProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  itemSize: number;
}

export const FlatJsonRow = (props: {
  item: JsonRowItem;
}) => {
  const item = props.item;
  const {
    right,
    rowItems,
    childs,
  } = item;

return (<div
    className="h-[2em] flex flex-row items-stretch gap-0"
  >
    {
      rowItems.map((upItem, i) => {
        const isRightmost = i + 1 === rowItems.length;
        return <FlatJsonUpCell
          key={"cell."+upItem.elementKey}
          item={upItem}
          right={isRightmost ? item : undefined}
          index={i}
        />
      })
    }
    <ValueCell vo={right} index={rowItems.length} />
  </div>)
}

export function VirtualScroll<T>({ data, renderItem, itemSize }: VirtualScrollProps<T>) {
  const Row = ({ index, style }: any) => {
    return (
      <div style={style}>
        {renderItem(data[index], index)}
      </div>
    );
  }

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
