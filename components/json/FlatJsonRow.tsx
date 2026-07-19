import { JsonGauge, JsonRowItem, isLeafType } from "@/libs/jetson";
import { DiffAnnotation } from "@/libs/diff";
import _ from "lodash";
import { FaThumbtack } from "react-icons/fa";
import { VscChevronDown, VscChevronUp, VscEdit } from "react-icons/vsc";
import { useAtomValue, useSetAtom } from "jotai";
import { FlatJsonValueCell } from "./FlatJsonValueCell";
import { InlineIcon } from "../lv1/InlineIcon";
import { useEffect, useRef, useState } from "react";
import { useManipulation } from "@/states/manipulation";
import { usePins, resolvedPinsAtom, pinJumpRequestAtom } from "@/states/pins";
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
 * ピンが打たれた行を示すグリフ列 + メモバルーン.
 * グリフはボタンで, 押すとグリフ直下にメモバルーンが開閉する。
 * バルーンの初手は読み取り専用の表示 (誤編集を防ぐ) で, 表示をクリックすると
 * 一手で編集に切り替わる。ピンを打った直後だけは編集状態で開く。
 * 編集は Enter・グリフ再クリック・フォーカス喪失で確定 / Esc で破棄して閉じる。
 * 何も入力しなければメモ無しのピンのまま閉じるだけで, メモ不要時の追加アクションは無い。
 * ドキュメントにピンが1つも無い間は列ごと描画されない (FlatJsonRow 側で制御)。
 */
const PinStatusCell = (props: {
  item: JsonRowItem;
  pinsHook: ReturnType<typeof usePins>;
}) => {
  const { item, pinsHook } = props;
  const pin = pinsHook.pinMap.get(item.elementKey);
  const pending = pinsHook.pendingMemo;
  const isOpen = !!pin && pending?.keypath === item.elementKey;
  const isEditing = isOpen && !!pending?.editing;
  const [draft, setDraft] = useState("");
  const viewRef = useRef<HTMLDivElement>(null);
  const resolvedPins = useAtomValue(resolvedPinsAtom);
  const requestPinJump = useSetAtom(pinJumpRequestAtom);

  // バルーンから前後のピンへ移動する (文書順・端で折り返し・移動先でもバルーンを開く)
  const jumpablePins = resolvedPins.filter((r) => r.item);
  const jumpToNeighborPin = (direction: 1 | -1) => {
    const currentIndex = jumpablePins.findIndex((r) => r.pin.keypath === item.elementKey);
    if (currentIndex < 0 || jumpablePins.length < 2) { return; }
    const dest = jumpablePins[(currentIndex + direction + jumpablePins.length) % jumpablePins.length];
    requestPinJump({ keypath: dest.pin.keypath, openBalloon: true });
  };

  // 編集に入るたびに下書きを現在のメモで初期化する
  useEffect(() => {
    if (isEditing) { setDraft(pin?.memo ?? ""); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // 表示バルーンにフォーカスを与え, 外側クリック (フォーカス喪失) で閉じられるようにする
  useEffect(() => {
    if (isOpen && !isEditing) { viewRef.current?.focus(); }
  }, [isOpen, isEditing]);

  const commit = () => {
    if (pin) {
      const memo = draft.trim();
      if (memo !== pin.memo) { pinsHook.updatePinMemo(item.elementKey, memo); }
    }
    pinsHook.closePendingMemo();
  };

  return <div
    className="grow-0 shrink-0 w-[2em] relative flex flex-row items-stretch justify-center pin-status-cell text-xs"
  >
    {pin && <button
      className="pin-status-button grow flex flex-row items-center justify-center"
      title={pin.memo || "メモを追加する"}
      // バルーンが開いている間はフォーカスを奪わない:
      // 表示・入力の blur (閉じる/確定) が先に走ると再レンダリングでクリックが失われるため
      onMouseDown={isOpen ? (e) => e.preventDefault() : undefined}
      onClick={() => {
        if (!isOpen) { pinsHook.openMemoView(item.elementKey); }
        else if (isEditing) { commit(); }
        else { pinsHook.closePendingMemo(); }
      }}
    ><FaThumbtack /></button>}
    {isOpen && <div className="pin-memo-balloon absolute top-full left-0 z-20 p-1">
      {isEditing
        ? <input
            className="pin-memo-input text-sm px-1 w-[18em]"
            autoFocus
            placeholder="メモ (Enter で確定 / Esc で閉じる)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            // グローバルショートカット (Cmd+A 等) に入力中のキーを奪われないようにする
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") { commit(); }
              if (e.key === "Escape") { pinsHook.closePendingMemo(); }
            }}
            onBlur={commit}
          />
        : <div
            ref={viewRef}
            tabIndex={-1}
            className="flex flex-row items-start gap-1 outline-none"
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Escape") { pinsHook.closePendingMemo(); }
              if (e.key === "ArrowUp") { e.preventDefault(); jumpToNeighborPin(-1); }
              if (e.key === "ArrowDown") { e.preventDefault(); jumpToNeighborPin(1); }
            }}
            // 外側をクリックしたら閉じる (バルーン内へのフォーカス移動では閉じない)
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                pinsHook.closePendingMemo();
              }
            }}
          >
            {/* ボタン群はバルーン左端 (= グリフ直下の固定位置) に置く:
                ピン巡回でメモの長さが変わっても位置が動かず, 連打で巡回できる */}
            {jumpablePins.length >= 2 && <>
              <button
                className="flippable shrink-0 px-1 flex flex-row items-center"
                title="前のピンへ (↑)"
                onClick={() => jumpToNeighborPin(-1)}
              ><InlineIcon i={<VscChevronUp />} /></button>
              <button
                className="flippable shrink-0 px-1 flex flex-row items-center"
                title="次のピンへ (↓)"
                onClick={() => jumpToNeighborPin(1)}
              ><InlineIcon i={<VscChevronDown />} /></button>
            </>}
            <button
              className="flippable shrink-0 px-1 flex flex-row items-center"
              title="メモを編集する"
              onClick={() => pinsHook.openMemoEdit(item.elementKey)}
            ><InlineIcon i={<VscEdit />} /></button>
            {/* メモ本文は選択・コピーできるプレーンテキスト */}
            <span className={`pin-memo-view text-sm px-1 max-w-[24em] break-words ${pin.memo ? "" : "pin-memo-placeholder"}`}>
              {pin.memo || "メモはありません"}
            </span>
          </div>
      }
    </div>}
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
  const isPendingMemo = props.pinsHook.pendingMemo?.keypath === elementKey && !diff;
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

    {/* メモバルーンが開いている間はメニューを出したままにする:
        ホバーが外れてもピンを外すボタンがその場に残る */}
    {isLeaf && (isHovered || isPendingMemo) && <ValueMenuCell item={item} />}
  </div>)
}
