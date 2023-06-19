import { JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { ActualIconForType, FlatJsonValueCell } from "./FlatJsonValueCell";
import { FixedSizeList } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import { InlineIcon } from "../lv1/InlineIcon";
import { useState } from "react";
import { ToggleButton } from "../lv1/ToggleButton";
import { useToggleState } from "@/states/view";
import { usePreference } from "@/states/preference";
import { useManipulation } from "@/states/manipulation";
import { IconButton } from "../lv1/IconButton";
import { VscCopy } from "react-icons/vsc";
import { useJSON } from "@/states";
import { ClipboardAccess } from "@/libs/sideeffect";
import { toast } from "react-toastify";


const RightmostKeyCell = (props: {
  index: number;
  right: JsonRowItem;
  isTogglable?: boolean;
}) => {
  const { toggleState, setToggleState } = useToggleState();
  if (typeof props.right.itemKey === "undefined") { return null; }
  const depth = props.index % 5;
  const text = typeof props.right.itemKey === "string" ? props.right.itemKey : `[${props.right.itemKey}]`;
  return <div
    className={`item-key w-[6em] grow-0 shrink-0 flex flex-row p-1 depth-${depth}`}
    style={{ overflow: "normal" }}
    title={props.right.itemKey.toString()}
  >
    {
      props.isTogglable
        ? <div>
            <ToggleButton
              isClosed={!!toggleState[props.right.index]}
              onClick={(isClosed) => setToggleState((prev) => {
                const next = _.cloneDeep(prev);
                if (isClosed) {
                  next[props.right.index] = isClosed;
                } else {
                  delete next[props.right.index];
                }
                return next;
              })}
            />
          </div>
        : null 
    }
    <p
      className='grow shrink text-base text-ellipsis whitespace-nowrap break-keep overflow-hidden'
    >
      {text}
    </p>
  </div>
}

const RightmostTypeCell = (props: {
  index: number;
  right: JsonRowItem;
}) => {
  const depth2 = props.index % 5;
  switch (props.right.right.type) {
    case "map": {
      return <div
        className={`grow-0 shrink-0 w-[6em] json-structure item-key item-type depth-${depth2} w-[6em] p-1 text-base text-center`}
      >
        <InlineIcon i={<ActualIconForType vo={props.right.right} />} />
        {props.right.childs?.length ?? 0}
      </div>
    }
    case "array": {
      return <div
        className={`grow-0 shrink-0 w-[6em] json-structure item-index item-type depth-${depth2} w-[6em] p-1 text-base text-center`}
      >
        <InlineIcon i={<ActualIconForType vo={props.right.right} />} />
        {props.right.childs?.length ?? 0}
      </div>
    }
  }
  return null;
}

const SubtreeMenuCell = (props: {
  item: JsonRowItem;
}) => {
  const { manipulation } = useManipulation();
  const { json } = useJSON();
  if (manipulation.selectedIndex !== props.item.index) { return null; }
  return (<div
    className="grow-0 shrink-0 flex flex-row items-center p-1 gap-1 text-sm"
  >
    <p>
      <IconButton
        icon={VscCopy}
        alt="Copy Subtree as JSON"
        onClick={async () => {
          const keyPath = props.item.elementKey;
          const subJson = keyPath ? _.get(json, keyPath) : json;
          if (!subJson) { return; }
          const subText = JSON.stringify(subJson, null, 2);
          try {
            await ClipboardAccess.copyText(subText);
            toast(`キーパス ${keyPath} のJSON文字列をクリップボードにコピーしました`);
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </p>
  </div>)
}

const SubtreeStatCell = (props: {
  item: JsonRowItem;
}) => {
  const { preference } = usePreference();
  if (!preference.visible_subtree_stat) { return null; }
  const stats = props.item.stats;
  return (<div
    className="grow-0 shrink-0 flex flex-row items-center stats secondary-foreground p-1 gap-3 text-sm"
  >
    <p>Items: {stats.item_count}</p>
    <p>Depth: {stats.max_depth}</p>
  </div>)
};

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
  const right = props.right;
  const isRightmost = !!right;
  const showTypeCell = right && (right.right.type === "array" || right.right.type === "map");
  const isTogglable = showTypeCell;

  // - KeyCell: isRightmost || isHovered 
  // - TypeCell: showTypeCell
  // - StatCell: showTypeCell

  if (!isRightmost) {
    // 最も右のLeadingCell ではない場合
    return <div
      className={`w-[6em] grow-0 shrink-0 item-index depth-${depth} text-base secondary-foreground`}
    >
      {props.isHovered ? <RightmostKeyCell index={props.index} right={props.nextItem} isTogglable={isTogglable} /> : null}
    </div>
  }

  // 最も右のLeadingCell である場合
  if (right.right.type === "array" || right.right.type === "map") {
    // 本来のitemが配列またはマップ
    // -> 本来のitemの添字またはキーを表示する
    //    - 本来のitemは開閉可能になるので, そのためのボタンを表示する
    // -> 続けて, 本来のitemの型と要素数を表示する
    return <>
      <RightmostKeyCell index={props.index} right={right} isTogglable={isTogglable} />
      <RightmostTypeCell index={props.typeIndex} right={right} />
      <SubtreeMenuCell item={right}/>
      <SubtreeStatCell item={right}/>
    </>
  } else {
    // 本来のitemが配列でもマップでもない
    // -> 開閉する必要がない
    return <RightmostKeyCell index={props.index} right={right} isTogglable={isTogglable} />
  }
}

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
  index: number;
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
          overscanCount={10}
        >
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
}
