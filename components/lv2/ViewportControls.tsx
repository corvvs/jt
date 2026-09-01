import { InlineIcon } from "@/components/lv1/InlineIcon";
import { MenuButton, MenuToggleButton } from "@/components/lv1/MenuButton";
import { HiChevronDoubleDown, HiChevronDoubleUp } from "react-icons/hi";
import { FaHighlighter, FaMap } from "react-icons/fa";
import { VscPinned } from "react-icons/vsc";
import { useToggleMass } from "@/states/view";
import { useEffectiveItems } from "@/states/json";
import { useMinimapPreference } from "@/states/minimap";
import { useHighlightPreference } from "@/states/highlight";
import { usePinsPreference } from "@/states/pins";
import { useDiffTarget } from "@/states/diff";
import { useTransientBackdrop } from "@/features/TransientBackdrop";

/**
 * JSON ビューポート右上に浮かせるローカル操作
 * (Fold all / Unfold all | Pins / Colors / MiniMap).
 *
 * 「今見ている JSON 本体に対する操作」なのでヘッダーではなくビューポートに属させる.
 *
 * 並びは「畳む操作」と「可視化操作」の2グループ. Pins・Colors (行に意味を付ける) と
 * MiniMap (その意味や検索・ピン・diff の分布を全体へ投影する) は使う場面が近いので
 * 隣接させ, Fold/Unfold との間だけ余白を広げて見た目のまとまりを作る.
 * ただし UI 上のコロケートであって, 両者の state は独立のまま:
 * 片方のトグルがもう片方を開閉することはなく, availability も互いに依存しない.
 *
 * 呼び出し側 (Main) の JSON 表示領域を positioning context (relative) にし,
 * この要素は absolute で通常フローから外れる:
 * AutoSizer / react-window が測るのは親の内容領域なので, overlay を足しても
 * ビューポートの幅・高さは変わらない (ミニマップで踏んだ自己増幅の再発を避ける).
 *
 * ミニマップの帯は JSON 表示領域の兄弟要素なので, この overlay とは重ならない.
 *
 * コンテナ自身には横 padding を置かない (余白はボタン側の padding で作る):
 * hover の transient-backdrop は静的位置 + translateX(offsetLeft) で置かれるため,
 * コンテナに padding があるとその分だけ backdrop が横にずれる.
 */
export const ViewportControls = () => {
  const flatJsons = useEffectiveItems();
  const { foldAll, unfoldAll } = useToggleMass();
  const { minimapPreference, setShowMinimap } = useMinimapPreference();
  const { highlightPreference, setShowHighlightPanel } = useHighlightPreference();
  const { pinsPreference, setShowPinsPanel } = usePinsPreference();
  // Pins と Colors は diff モード中は使えない (ヘッダーにあった頃と同じ). MiniMap は diff でも有効.
  const { diffTarget } = useDiffTarget();
  const {
    handleMouseEnter,
    handleMouseLeave,
    handleContainerMouseOver,
    backdrop,
  } = useTransientBackdrop();

  return (
    <div
      className="viewport-controls absolute top-1 right-4 z-10 flex flex-row items-center gap-1 text-sm"
      onMouseOver={handleContainerMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      {backdrop}

      <MenuButton
        onClick={() => foldAll()}
        onMouseEnter={handleMouseEnter}
        disabled={!flatJsons}
        title="Fold all"
      >
        <InlineIcon i={<HiChevronDoubleUp />} />
      </MenuButton>

      <MenuButton
        onClick={() => unfoldAll()}
        onMouseEnter={handleMouseEnter}
        disabled={!flatJsons}
        title="Unfold all"
      >
        <InlineIcon i={<HiChevronDoubleDown />} />
      </MenuButton>

      <MenuToggleButton
        className="ml-4"
        isToggled={pinsPreference.showPanel && !diffTarget}
        onClick={(value) => setShowPinsPanel(value)}
        onMouseEnter={handleMouseEnter}
        disabled={!flatJsons || !!diffTarget}
        title="ピンのパネルを開閉する"
        ariaLabel="Pins"
      >
        <InlineIcon i={<VscPinned />} />
        <span>Pins</span>
      </MenuToggleButton>

      <MenuToggleButton
        isToggled={highlightPreference.showPanel && !diffTarget}
        onClick={(value) => setShowHighlightPanel(value)}
        onMouseEnter={handleMouseEnter}
        disabled={!flatJsons || !!diffTarget}
        title="カラーリングルールのパネルを開閉する"
        ariaLabel="Colors"
      >
        <InlineIcon i={<FaHighlighter />} />
        <span>Colors</span>
      </MenuToggleButton>

      <MenuToggleButton
        isToggled={minimapPreference.showPanel}
        onClick={(value) => setShowMinimap(value)}
        onMouseEnter={handleMouseEnter}
        disabled={!flatJsons}
        title="MiniMap の表示を切り替える"
        ariaLabel="MiniMap"
      >
        <InlineIcon i={<FaMap />} />
        <span>MiniMap</span>
      </MenuToggleButton>
    </div>
  );
};
