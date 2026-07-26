import { JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { useRef } from "react";
import { VscEllipsis } from "react-icons/vsc";
import { useManipulation } from "@/states/manipulation";
import { useToggleSingle } from "@/states/view";
import { useKeyMenu } from "@/states/key_menu";
import { KeyMenu } from "./leading/KeyMenu";

/**
 * 行番号のセル.
 *
 * ルート行に限り, ここがキーメニューの的になる: ルートはキーを持たないので
 * キーセルが描かれず (Leading.tsx の RightmostKeyCell が null を返す), 他の行と
 * 同じ所作では開けない。ルート行以外で行番号を押しても何も起きない — キーや値から
 * 遠い位置に行の操作を置くと, 対象を見ながら操作できなくなるため。
 */
export const LineNumberCell = (props: {
  item: JsonRowItem;
  manipulationHook: ReturnType<typeof useManipulation>;
  toggleSingleHook: ReturnType<typeof useToggleSingle>;
  keyMenuHook: ReturnType<typeof useKeyMenu>;
}) => {
  const { item, keyMenuHook } = props;
  const cellRef = useRef<HTMLDivElement>(null);
  const isRoot = item.rowItems.length === 0;
  const isMenuOpen = isRoot && keyMenuHook.isKeyMenuOpen(item.index, item.index);

  return <div
    ref={cellRef}
    className={
      `w-[4em] grow-0 shrink-0 flex flex-row justify-end items-center p-1 line-number text-sm line-number-cell ${isMenuOpen ? "key-menu-open" : ""}`
    }
  >
    {isRoot
      ? <button
          // セル全体を的にする: 数字だけだとポインタで隠れて印が見えない
          className="key-menu-trigger line-number-menu-trigger w-full h-full flex flex-row items-center justify-end gap-1 px-1"
          title="クリックでメニュー (ドキュメント全体のコピー / 保存 / ピン)"
          onClick={() => keyMenuHook.toggleKeyMenu(item.index, item.index)}
        >
          {/* 押せることが常に分かるようにメニューの印を出す (ルート行だけ) */}
          <span className="line-number-menu-mark flex flex-row items-center"><VscEllipsis /></span>
          <span>{item.lineNumber}</span>
        </button>
      : <div>{item.lineNumber}</div>
    }

    {isMenuOpen && <KeyMenu
      item={item}
      anchorRef={cellRef}
      onClose={keyMenuHook.closeKeyMenu}
      manipulationHook={props.manipulationHook}
      toggleSingleHook={props.toggleSingleHook}
    />}
  </div>
}
