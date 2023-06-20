import { JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { ActualIconForType } from "../FlatJsonValueCell";
import { InlineIcon } from "@/components/lv1/InlineIcon";
import { ToggleButton } from "@/components/lv1/ToggleButton";
import { useToggleState } from "@/states/view";
import { SubtreeMenuCell, SubtreeStatCell } from "../subtree/Subtree";

const RightmostKeyCell = (props: {
  index: number;
  right: JsonRowItem;
  isTogglable?: boolean;
}) => {
  const { toggleState, toggleItem } = useToggleState();
  if (typeof props.right.itemKey === "undefined") { return null; }
  const depth = props.index % 5;
  const text = typeof props.right.itemKey === "string" ? props.right.itemKey : `[${props.right.itemKey}]`;
  return <div
    className={`item-key w-[6em] grow-0 shrink-0 flex flex-row items-center p-1 depth-${depth}`}
    style={{ overflow: "normal" }}
    title={props.right.itemKey.toString()}
  >
    {
      props.isTogglable
        ? <ToggleButton
            isClosed={!!toggleState[props.right.index]}
            onClick={(isClosed) => toggleItem(props.right, isClosed)}
          />
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

/**
 * その行の本来のアイテムの左側に表示されるセル
 */
export const FlatJsonLeadingCell = (props: {
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
      <SubtreeMenuCell item={right} isHovered={props.isHovered} />
      <SubtreeStatCell item={right} />
    </>
  } else {
    // 本来のitemが配列でもマップでもない
    // -> 開閉する必要がない
    return <RightmostKeyCell index={props.index} right={right} isTogglable={isTogglable} />
  }
}