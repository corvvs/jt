import { JsonGauge, JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { ActualIconForType } from "../FlatJsonValueCell";
import { InlineIcon } from "@/components/lv1/InlineIcon";
import { ToggleButton } from "@/components/lv1/ToggleButton";
import { useToggleSingle } from "@/states/view";
import { SubtreeMenuCell } from "../subtree/Subtree";
import { useManipulation } from "@/states/manipulation";
import { FaGlasses } from "react-icons/fa";
import { usePreformattedValueModal } from "@/states/modal";

const RightmostKeyCell = (props: {
  index: number;
  gauge?: JsonGauge;
  right: JsonRowItem;
  isTogglable?: boolean;
  isMatched?: boolean;
  toggleSingleHook: ReturnType<typeof useToggleSingle>;
}) => {
  const {
    right,
    gauge,
    index,
    isMatched,
  } = props;
  const { openModal } = usePreformattedValueModal();
  if (typeof right.itemKey === "undefined") { return null; }
  const { toggleState, toggleItem } = props.toggleSingleHook;
  const depth = index % 5;
  const text = typeof right.itemKey === "string" ? right.itemKey : `[${right.itemKey}]`;
  const currentColumnLength = gauge ? gauge.crampedKeyLengths[index + 1] : 6;  

  return <div
    className={`item-key grow-0 shrink-0 flex flex-row items-center p-1 depth-${depth} ${isMatched ? "matched-cell" : ""}`}
    style={{ width: `${currentColumnLength}em`, overflow: "normal" }}
    title={right.itemKey.toString()}
  >
    <p
      className='grow shrink text-ellipsis whitespace-nowrap break-keep overflow-hidden'
    >
      {text}
    </p>

    {
      props.isTogglable
        ? <div
            className="w-[1em] shrink-0 grow-0 flex flex-row items-center"
          >
            <ToggleButton
                isClosed={!!toggleState[right.index]}
                onClick={(isClosed) => toggleItem(right, isClosed)}
              />
          </div>
        : null 
    }
    {
      right.isPreformattedValue
        ? <div
            className="w-[1em] shrink-0 grow-0 flex flex-row items-center"
          >
            <button
              className="font-bold"
              onClick={() => openModal(right.right.value as string)}
            >
              <FaGlasses />
            </button>
          </div>
        : null
    }
  </div>
}

const RightmostTypeCell = (props: {
  index: number;
  gauge?: JsonGauge;
  right: JsonRowItem;
}) => {
  const {
    gauge,
    index,
  } = props;
  const depth2 = props.index % 5;
  const currentColumnLength = gauge ? gauge.crampedKeyLengths[index + 1] : 6;
  switch (props.right.right.type) {
    case "map": {
      return <div
        className={`grow-0 shrink-0 json-structure item-key item-type depth-${depth2} p-1 text-center`}
        style={{ width: `${currentColumnLength}em` }}
      >
        <InlineIcon i={<ActualIconForType vo={props.right.right} />} />
        {props.right.childs?.length ?? 0}
      </div>
    }
    case "array": {
      return <div
        className={`grow-0 shrink-0 json-structure item-index item-type depth-${depth2} p-1 text-center`}
        style={{ width: `${currentColumnLength}em` }}
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
  gauge?: JsonGauge;
  nextItem: JsonRowItem;
  index: number;
  typeIndex: number;
  isHovered: boolean;
  isMatched: boolean;
  isNarrowedFrom: boolean;
  manipulationHook: ReturnType<typeof useManipulation>;
  toggleSingleHook: ReturnType<typeof useToggleSingle>;
  /**
   * その行に本来表示したいアイテム
   * 「最も右のLeadingCell」にのみ与えられる
   */
  right?: JsonRowItem;
}) => {

  const depth = props.index % 5;
  const {
    right,
    gauge,
    isMatched,
    index,
    manipulationHook,
    toggleSingleHook,
  } = props;
  const isRightmost = !!right;
  const showTypeCell = right && (right.right.type === "array" || right.right.type === "map");
  const isTogglable = showTypeCell;
  const currentColumnLength = gauge ? gauge.crampedKeyLengths[index + 1] : 6;

  if (!isRightmost) {
    // 最も右のLeadingCell ではない場合
    return <div
      className={`grow-0 shrink-0 item-index depth-${depth} ${props.isNarrowedFrom ? "" : "secondary-foreground"}`}
      style={{ width: `${currentColumnLength}em` }}
    >
      {
        (props.isHovered || props.isNarrowedFrom)
          ? <RightmostKeyCell
            index={props.index} gauge={gauge} right={props.nextItem} isTogglable={isTogglable}
            toggleSingleHook={toggleSingleHook}
          />
          : null
      }
    </div>
  }

  // 最も右のLeadingCell である場合
  if (right.right.type === "array" || right.right.type === "map") {
    // 本来のitemが配列またはマップ
    // -> 本来のitemの添字またはキーを表示する
    //    - 本来のitemは開閉可能になるので, そのためのボタンを表示する
    // -> 続けて, 本来のitemの型と要素数を表示する
    return <>
      <RightmostKeyCell
        index={props.index}gauge={gauge} right={right} isTogglable={isTogglable} isMatched={isMatched}
        toggleSingleHook={toggleSingleHook}
      />
      <RightmostTypeCell
        index={props.typeIndex} gauge={gauge} right={right}
      />
      <SubtreeMenuCell
        item={right}
        isHovered={props.isHovered}
        toggleSingleHook={toggleSingleHook}
        manipulationHook={manipulationHook}
      />
    </>
  } else {
    // 本来のitemが配列でもマップでもない
    // -> 開閉する必要がない
    return <RightmostKeyCell
      gauge={gauge} index={props.index} right={right} isTogglable={isTogglable} isMatched={isMatched}
      toggleSingleHook={toggleSingleHook}
    />
  }
}