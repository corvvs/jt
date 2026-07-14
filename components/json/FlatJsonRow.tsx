import { JsonGauge, JsonRowItem } from "@/libs/jetson";
import { isDiffRowItem } from "@/libs/diff";
import _ from "lodash";
import { FlatJsonValueCell } from "./FlatJsonValueCell";
import { useState } from "react";
import { useManipulation } from "@/states/manipulation";
import { FlatJsonLeadingCell } from "./leading/Leading";
import { LineNumberCell } from "./LineNumberCell";
import { useToggleSingle } from "@/states/view";
import { CopyButton, DownloadButton } from "../lv3/CopyButton";

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

const DownloadValueButton = (props: {
  item: JsonRowItem;
}) => <DownloadButton
  alt="この要素をJSONファイルとしてダウンロードする"
  getData={() => props.item.right.value}
  getToastText={() => `値をファイルとしてダウンロードしました`}
  filename={`value-${props.item.elementKey.replace(/[^\w-]/g, '_')}.json`}
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

/**
 * diff ビューでの行の状態を示すグリフ列.
 * 行の背景色に頼らず added / removed / changed を判別できるようにする (色覚対応).
 * diff ビューでない行では何も描画しない.
 */
const DiffStatusCell = (props: {
  item: JsonRowItem;
}) => {
  if (!isDiffRowItem(props.item)) { return null; }
  const { glyph, className, alt } = (() => {
    switch (props.item.diff.status) {
      case "added":
        return { glyph: "+", className: "diff-status-added", alt: "新側にのみ存在します" };
      case "removed":
        return { glyph: "−", className: "diff-status-removed", alt: "旧側にのみ存在します" };
      case "changed":
        // 形は added / removed と同じ + / − だが, グリフと行背景の色 (琥珀) で
        // 「同一キーの値変更」であることを区別する
        return props.item.diff.side === "old"
          ? { glyph: "−", className: "diff-status-changed", alt: "値が変更されています (これは変更前の値)" }
          : { glyph: "+", className: "diff-status-changed", alt: "値が変更されています (これは変更後の値)" };
      case "child_changed":
        return { glyph: "·", className: "diff-status-child-changed", alt: "内部に差分があります" };
      default:
        return { glyph: "", className: "", alt: "" };
    }
  })();
  return <div
    className={`grow-0 shrink-0 w-[1.25em] flex items-center justify-center font-monospacy ${className}`}
    title={alt}
  >{glyph}</div>;
};

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
    {showCopyValueButton && <DownloadValueButton item={props.item} />}
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
  const diff = isDiffRowItem(item) ? item.diff : undefined;
  const diffBackgroundClass = diff
    ? (diff.status === "added"
      ? "diff-added-row"
      : diff.status === "removed"
        ? "diff-removed-row"
        : diff.status === "changed"
          ? "diff-changed-row"
          : "")
    : "";
  const backgroundClass = (isMatched && filteringPreference.resultAppearance !== "just")
    ? "matched-row"
    : diffBackgroundClass
      ? diffBackgroundClass
      : isNarrowedFrom
        ? "narrowed-from-row"
        : isHovered
          ? "secondary-background"
          : "";
  const isChangedNewSide = diff?.status === "changed" && diff.side === "new";
  return (<div
    className={
      `h-[2em] flex flex-row items-stretch gap-0 ${backgroundClass} ${isWeaken ? "weaken-row" : ""} ${isChangedNewSide ? "diff-changed-new-row" : ""}`
    }
    onMouseOver={() => setIsHovered(true)}
    onMouseOut={() => setIsHovered(false)}
  >
    <LineNumberCell item={item} />

    <DiffStatusCell item={item} />

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
