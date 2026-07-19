import { JsonGauge, JsonRowItem, isLeafType } from "@/libs/jetson";
import { DiffAnnotation } from "@/libs/diff";
import _ from "lodash";
import { FaThumbtack } from "react-icons/fa";
import { FlatJsonValueCell } from "./FlatJsonValueCell";
import { useState } from "react";
import { useManipulation } from "@/states/manipulation";
import { usePins } from "@/states/pins";
import { FlatJsonLeadingCell } from "./leading/Leading";
import { LineNumberCell } from "./LineNumberCell";
import { useToggleSingle } from "@/states/view";
import { CopyButton, DownloadButton } from "../lv3/CopyButton";
import { PinToggleButton } from "../lv3/PinButton";

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

type DiffAppearance = {
  glyph: string;
  statusClass: string;
  rowClass: string;
  alt: string;
};

/**
 * DiffStatus → 表示 (グリフ / グリフ色 / 行背景 / 説明) の唯一の対応表.
 * child_changed は背景を塗らずグリフのみ. same は何も出さない (null).
 */
const diffAppearanceOf = (diff: DiffAnnotation): DiffAppearance | null => {
  switch (diff.status) {
    case "added":
      return { glyph: "+", statusClass: "diff-status-added", rowClass: "diff-added-row", alt: "新側にのみ存在します" };
    case "removed":
      return { glyph: "−", statusClass: "diff-status-removed", rowClass: "diff-removed-row", alt: "旧側にのみ存在します" };
    case "changed":
      // 形は added / removed と同じ + / − だが, グリフと行背景の色 (琥珀) で
      // 「同一キーの値変更」であることを区別する
      return diff.side === "old"
        ? { glyph: "−", statusClass: "diff-status-changed", rowClass: "diff-changed-row", alt: "値が変更されています (これは変更前の値)" }
        : { glyph: "+", statusClass: "diff-status-changed", rowClass: "diff-changed-row", alt: "値が変更されています (これは変更後の値)" };
    case "child_changed":
      return { glyph: "·", statusClass: "diff-status-child-changed", rowClass: "", alt: "内部に差分があります" };
    default:
      return null;
  }
};

/**
 * diff ビューでの行の状態を示すグリフ列.
 * 行の背景色に頼らず added / removed / changed を判別できるようにする (色覚対応).
 * diff ビューでない行では何も描画しない.
 */
const DiffStatusCell = (props: {
  item: JsonRowItem;
}) => {
  const diff = props.item.diff;
  if (!diff) { return null; }
  const appearance = diffAppearanceOf(diff);
  // changed ペアの2行を縦バーで繋ぎ, 同一キーの値変更であることを示す
  const isChangedPair = diff.status === "changed";
  return <div
    className={`grow-0 shrink-0 w-[1.25em] flex items-center justify-center font-monospacy ${appearance?.statusClass ?? ""} ${isChangedPair ? "diff-changed-pair-cell" : ""}`}
    title={appearance?.alt}
  >{appearance?.glyph ?? ""}</div>;
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
    <PinToggleButton item={props.item} />
    {showCopyValueButton && <CopyValueButton item={props.item} />}
    {showCopyValueButton && <DownloadValueButton item={props.item} />}
    {showCopyKeyPathButton && <CopyKeyPathButton item={props.item} />}
    </div>
}

/**
 * ピンが打たれた行を示すグリフ列.
 * ドキュメントにピンが1つも無い間は列ごと描画されない (FlatJsonRow 側で制御).
 */
const PinStatusCell = (props: {
  item: JsonRowItem;
  pinsHook: ReturnType<typeof usePins>;
}) => {
  const pin = props.pinsHook.pinMap.get(props.item.elementKey);
  return <div
    className="grow-0 shrink-0 w-[1.25em] flex items-center justify-center pin-status-cell text-xs"
    title={pin ? (pin.memo || pin.keypath || "(ルート)") : undefined}
  >{pin ? <FaThumbtack /> : null}</div>;
};

/**
 * ピンを打った直後にその行に出すクイックメモ入力.
 * Enter で確定 / Esc・フォーカス喪失で閉じる. 何も入力しなければメモ無しのピンのまま
 * 消えるだけなので, メモが不要なときの追加アクションは無い.
 */
const PinQuickMemoCell = (props: {
  item: JsonRowItem;
  pinsHook: ReturnType<typeof usePins>;
}) => {
  const [draft, setDraft] = useState("");
  const { updatePinMemo, closePendingMemo } = props.pinsHook;

  const commit = () => {
    const memo = draft.trim();
    if (memo) { updatePinMemo(props.item.elementKey, memo); }
    closePendingMemo();
  };

  return <div className="grow-0 shrink-0 flex flex-row items-center p-1">
    <input
      className="pin-memo-input text-sm px-1 w-[18em]"
      autoFocus
      placeholder="メモ (Enter で確定 / Esc で閉じる)"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      // グローバルショートカット (Cmd+A 等) に入力中のキーを奪われないようにする
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") { commit(); }
        if (e.key === "Escape") { closePendingMemo(); }
      }}
      onBlur={commit}
    />
  </div>;
};

export const FlatJsonRow = (props: {
  item: JsonRowItem;
  manipulationHook: ReturnType<typeof useManipulation>;
  toggleSingleHook: ReturnType<typeof useToggleSingle>;
  pinsHook: ReturnType<typeof usePins>;
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
  const isLeaf = isLeafType(right.type);
  const diff = item.diff;
  const isPendingMemo = props.pinsHook.pendingMemoKeypath === elementKey && !diff;
  // 行の背景は優先順: 検索マッチ > diff 状態 > ナローイング起点 > ホバー
  const backgroundClass = [
    (isMatched && filteringPreference.resultAppearance !== "just") ? "matched-row" : "",
    diff ? diffAppearanceOf(diff)?.rowClass ?? "" : "",
    isNarrowedFrom ? "narrowed-from-row" : "",
    isHovered ? "secondary-background" : "",
  ].find(Boolean) ?? "";
  const isChangedNewSide = diff?.status === "changed" && diff.side === "new";
  return (<div
    className={
      `h-[2em] flex flex-row items-stretch gap-0 ${backgroundClass} ${isWeaken ? "weaken-row" : ""} ${isChangedNewSide ? "diff-changed-new-row" : ""}`
    }
    onMouseOver={() => setIsHovered(true)}
    onMouseOut={() => setIsHovered(false)}
  >
    <LineNumberCell item={item} />

    {/* diff モードではピンを扱わない (行の index 空間が別物になる) */}
    {props.pinsHook.hasPins && !diff && <PinStatusCell item={item} pinsHook={props.pinsHook} />}

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

    {/* クイックメモ入力が出ている間はメニューを出したままにする:
        ホバーが外れてもピンボタンの位置が動かず, もう一度押せばピンを外せる */}
    {isLeaf && (isHovered || isPendingMemo) && <ValueMenuCell item={item} />}

    {isPendingMemo && <PinQuickMemoCell item={item} pinsHook={props.pinsHook} />}
  </div>)
}
