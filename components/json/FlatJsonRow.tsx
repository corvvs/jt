import { JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { FlatJsonValueCell } from "./FlatJsonValueCell";
import { FixedSizeList } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';


const RightmostKeyCell = (props: {
  index: number;
  right: JsonRowItem;
}) => {
  const depth = props.index % 5;
  switch (typeof props.right.itemKey) {
    case "string": {
      // キーを表示する
      return <div
        className={`min-w-[6em] grow shrink p-1 item-key depth-${depth} text-base text-ellipsis whitespace-nowrap overflow-hidden`}
      >{props.right.itemKey}</div>
    }
    case "number": {
      // インデックスを表示する
      return <div
        className={`min-w-[6em] grow shrink p-1 item-index depth-${depth} text-base text-ellipsis whitespace-nowrap overflow-hidden`}
      >#{props.right.itemKey}</div>
    }
  }
  throw new Error("unreachable");
}

const RightmostTypeCell = (props: {
  index: number;
  right: JsonRowItem;
}) => {
  const depth2 = (props.index + 1) % 5;
  switch (props.right.right.type) {
    case "map": {
      return <div
        className={`grow-0 shrink-0 json-structure item-key item-value depth-${depth2} w-[6em] py-1 text-base text-center text-gray-500`}
      >
        {"{Map:"}
        {props.right.childs?.length ?? 0}
        {"}"}
      </div>
    }
    case "array": {
      return <div
        className={`grow-0 shrink-0 json-structure item-index item-value depth-${depth2} w-[6em] py-1 text-base text-center text-gray-500`}
      >
        {"[Array:"}
        {props.right.childs?.length ?? 0}
        {"]"}
      </div>
    }
  }
  return null;
}

/**
 * その行の本来のアイテムの左側に表示されるセル
 */
const FlatJsonUpCell = (props: {
  item: JsonRowItem;
  index: number;
  /**
   * その行に本来表示したいアイテム
   * 「最も右のUpCell」にのみ与えられる
   */
  right?: JsonRowItem;
}) => {

  const depth = props.index % 5;
  if (!props.right) {
    // 何も出さなくてよい
    return <div
      className={`w-[6em] grow-0 shrink-0 item-index depth-${depth} text-base`}
    />
  }

  if (props.right.right.type === "array" || props.right.right.type === "map") {
    return <div
      className="w-[18em] flex flex-row"
      >
      <RightmostKeyCell index={props.index} right={props.right} />
      <RightmostTypeCell index={props.index} right={props.right} />
    </div>
  } else {
    return <div
      className="min-w-[12em] flex flex-row"
      >
      <RightmostKeyCell index={props.index} right={props.right} />
    </div>
  }

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
    <FlatJsonValueCell vo={right} index={rowItems.length} />
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
