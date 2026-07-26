import { RefObject, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { VscCloudDownload, VscCopy, VscPin, VscPinned } from "react-icons/vsc";
import { CgArrowsBreakeV, CgArrowsShrinkV } from "react-icons/cg";
import { JsonRowItem, isLeafType, segmentsOf } from "@/libs/jetson";
import { buildKeyQueryCandidates, countQueryMatches } from "@/libs/key_query";
import { extractSubtree } from "@/libs/partial_tree";
import { ClipboardAccess, FileDownload } from "@/libs/sideeffect";
import { applyGeneratedQuery, useManipulation } from "@/states/manipulation";
import { useEffectiveItems } from "@/states/json";
import { useJSON } from "@/states";
import { useDiffTarget } from "@/states/diff";
import { usePins } from "@/states/pins";
import { useToggleSingle } from "@/states/view";
import { InlineIcon } from "@/components/lv1/InlineIcon";
import _ from "lodash";

/**
 * 画面端からの余白 (メニューをはみ出させない)
 */
const ViewportMargin = 4;

const MenuRow = (props: {
  label: string;
  /** 右寄せで添える補助表示 (クエリ文字列やヒット件数) */
  query?: string;
  count?: string;
  icon?: JSX.Element;
  isActive?: boolean;
  title?: string;
  onClick: () => void;
}) => {
  return <button
    className={`key-menu-row w-full flex flex-row items-center gap-2 px-2 py-1 text-left ${props.isActive ? "is-active" : ""}`}
    title={props.title}
    // クリックでフォーカスが外れ, blur (= 閉じる) が click より先に走るのを防ぐ
    onMouseDown={(e) => e.preventDefault()}
    onClick={props.onClick}
  >
    {props.icon && <span className="shrink-0 flex flex-row items-center">{props.icon}</span>}
    <span className="shrink-0">{props.label}</span>
    {props.query && <span
      className="key-menu-query shrink grow font-monospacy text-xs overflow-hidden text-ellipsis whitespace-nowrap break-keep"
    >{props.query}</span>}
    {props.count && <span className="key-menu-count shrink-0 ml-auto text-xs">{props.count}</span>}
  </button>;
};

/**
 * キーセル (ルート行は行番号セル) のクリックで開くメニュー.
 *
 * 位置決めは document.body へのポータル + fixed で行う: 行の中に absolute で置くと
 * 仮想スクロールの外枠 (overflow: auto) に切られ, リスト下端では出せなくなる。
 * 開いたままスクロールされると行と離れてしまうので, スクロールを拾ったら閉じる。
 *
 * 祖先セルから開いた場合, 対象は行のアイテムではなくその段のノードになる。
 * 部分木のコピーやナローイングもその段に効くので, 深い行から囲っている要素を
 * その場で操作できる。
 */
export const KeyMenu = (props: {
  /** メニューの対象ノード */
  item: JsonRowItem;
  /** 位置決めの基準にするセル */
  anchorRef: RefObject<HTMLElement>;
  onClose: () => void;
  manipulationHook: ReturnType<typeof useManipulation>;
  toggleSingleHook: ReturnType<typeof useToggleSingle>;
}) => {
  const { item, anchorRef, onClose, manipulationHook, toggleSingleHook } = props;
  const menuRef = useRef<HTMLDivElement>(null);
  const flatJsons = useEffectiveItems();
  const { json } = useJSON();
  const { diffTarget } = useDiffTarget();
  const { canPin, pinMap, togglePin } = usePins();
  const filteringQuery = manipulationHook.manipulation.filteringQuery;

  const candidates = useMemo(() => buildKeyQueryCandidates(item), [item]);
  // 候補ごとに全行を走るので, メニューを開いた時に1回だけ数える
  const counts = useMemo(
    () => candidates.map((candidate) => (
      flatJsons ? countQueryMatches(flatJsons.items, candidate.query) : null
    )),
    [candidates, flatJsons],
  );

  // 実寸を測ってから, 画面内に収まる位置へ寄せて可視にする (下に出せなければ上に反転).
  // 位置を state に持たず DOM へ直接書くのは, 描画をもう1回挟まずにこの場で
  // 可視化＋フォーカスまで済ませるため (visibility: hidden の間は focus できない)。
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const menu = menuRef.current;
    if (!anchor || !menu) { return; }
    const rect = anchor.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = menu;
    const left = Math.max(ViewportMargin, Math.min(rect.left, window.innerWidth - width - ViewportMargin));
    const top = rect.bottom + height + ViewportMargin <= window.innerHeight
      ? rect.bottom
      : Math.max(ViewportMargin, rect.top - height);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.visibility = "visible";
    // 外側クリック (フォーカス喪失) で閉じられるようにフォーカスを取る
    menu.focus();
  }, [anchorRef, candidates]);

  // スクロールすると基準のセルが動くので閉じる (capture: 内側のスクロール枠も拾う)
  useEffect(() => {
    const handleScroll = () => onClose();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [onClose]);

  const segments = segmentsOf(item);
  const isLeaf = isLeafType(item.right.type);
  const isPinned = pinMap.has(item.elementKey);
  const showPin = !diffTarget && canPin;
  const rawJson = json && json.status === "accepted" ? json.json : null;
  const isNarrowed = _.last(manipulationHook.manipulation.narrowedRanges)?.from === item.index;
  // ルートへのナローイングは全体表示と同じなので出さない
  const canNarrow = !isLeaf && !isNarrowed && segments.length > 0;

  const withClose = (f: () => void) => () => {
    try {
      f();
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  const copyText = (text: string, message: string) => withClose(() => {
    ClipboardAccess.copyText(text).then(() => toast(message)).catch((e) => console.error(e));
  });

  const subtreeLabel = item.elementKey || "ドキュメント全体";

  const queryRows = candidates.map((candidate, i) => {
    const count = counts[i];
    return <MenuRow
      key={candidate.id}
      label={candidate.label}
      query={candidate.query}
      count={count === null ? undefined : `${count}件`}
      isActive={filteringQuery === candidate.query}
      title={`${candidate.query}\nクリックでこのクエリを適用する (再クリックで解除)`}
      onClick={withClose(() => applyGeneratedQuery(
        manipulationHook, candidate.query, filteringQuery === candidate.query,
      ))}
    />;
  });

  return createPortal(
    <div
      ref={menuRef}
      tabIndex={-1}
      className="key-menu flex flex-col outline-none text-sm"
      // 実寸を測る前の1フレームを見せない (位置と可視化は useLayoutEffect が書く)
      style={{ position: "fixed", left: 0, top: 0, visibility: "hidden" }}
      // メニュー内へのフォーカス移動では閉じない
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { onClose(); }
      }}
      // グローバルショートカット (Esc でナローイング解除など) にキーを奪われないようにする
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") { onClose(); }
      }}
    >
      <div className="key-menu-header px-2 py-1 text-xs font-monospacy overflow-hidden text-ellipsis whitespace-nowrap break-keep">
        {item.elementKey || "(root)"}
      </div>

      {queryRows.length > 0
        ? <div className="key-menu-section flex flex-col">{queryRows}</div>
        : segments.length > 0
          ? <div className="key-menu-note px-2 py-1 text-xs">
              キー名に検索式で書けない文字があるため, クエリを作れません
            </div>
          : null
      }

      <div className="key-menu-section flex flex-col">
        {segments.length > 0 && <MenuRow
          label="キーパスをコピー"
          icon={<InlineIcon i={<VscCopy />} />}
          onClick={copyText(item.elementKey, `KeyPath ${item.elementKey} をクリップボードにコピーしました`)}
        />}

        {isLeaf ? <>
          <MenuRow
            label="値をコピー"
            icon={<InlineIcon i={<VscCopy />} />}
            onClick={copyText(JSON.stringify(item.right.value, null, 2), "値をクリップボードにコピーしました")}
          />
          <MenuRow
            label="値をファイルに保存"
            icon={<InlineIcon i={<VscCloudDownload />} />}
            onClick={withClose(() => {
              FileDownload.downloadAsJson(
                item.right.value,
                `value-${item.elementKey.replace(/[^\w-]/g, "_")}.json`,
              );
              toast("値をファイルとしてダウンロードしました");
            })}
          />
        </> : rawJson !== null && <>
          <MenuRow
            label="この要素以下をコピー"
            icon={<InlineIcon i={<VscCopy />} />}
            onClick={copyText(
              JSON.stringify(extractSubtree(rawJson, segments), null, 2),
              `${subtreeLabel} のJSONをクリップボードにコピーしました`,
            )}
          />
          <MenuRow
            label="この要素以下をファイルに保存"
            icon={<InlineIcon i={<VscCloudDownload />} />}
            onClick={withClose(() => {
              FileDownload.downloadAsJson(
                extractSubtree(rawJson, segments),
                `subtree-${(item.elementKey || "root").replace(/[^\w-]/g, "_")}.json`,
              );
              toast(`${subtreeLabel} のJSONをダウンロードしました`);
            })}
          />
        </>}
      </div>

      {(canNarrow || isNarrowed || showPin) && <div className="key-menu-section flex flex-col">
        {canNarrow && <MenuRow
          label="この要素以下だけを表示"
          icon={<InlineIcon i={<CgArrowsShrinkV />} />}
          title="ナローイング. 祖先のキーを押せば, その段まで遡って絞り込める"
          onClick={withClose(() => {
            manipulationHook.pushNarrowedRange(item.index, flatJsons!.items);
            // 閉じているなら開く
            toggleSingleHook.toggleItem(item, false);
          })}
        />}
        {isNarrowed && <MenuRow
          label="ナローイングを解除"
          icon={<InlineIcon i={<CgArrowsBreakeV />} />}
          onClick={withClose(() => manipulationHook.popNarrowedRange(-1))}
        />}
        {showPin && <MenuRow
          label={isPinned ? "ピンを外す" : "ピンを打つ"}
          icon={<InlineIcon i={isPinned ? <VscPinned /> : <VscPin />} />}
          onClick={withClose(() => togglePin(item))}
        />}
      </div>}
    </div>,
    document.body,
  );
};
