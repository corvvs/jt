import { InlineIcon } from "@/components/lv1/InlineIcon";
import { MenuButton, MenuToggleButton } from "@/components/lv1/MenuButton";
import { HiChevronDoubleDown, HiChevronDoubleUp } from "react-icons/hi";
import { FaMap } from "react-icons/fa";
import { useToggleMass } from "@/states/view";
import { useEffectiveItems } from "@/states/json";
import { useMinimapPreference } from "@/states/minimap";
import { useTransientBackdrop } from "@/features/TransientBackdrop";

/**
 * JSON ビューポート右上に浮かせるローカル操作 (Fold all / Unfold all / MiniMap).
 *
 * 「今見ている JSON 本体に対する操作」なのでヘッダーではなくビューポートに属させる.
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
