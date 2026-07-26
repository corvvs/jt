import { JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { usePreference } from "@/states/preference";
import { useManipulation } from "@/states/manipulation";
import { IconButton } from "@/components/lv1/IconButton";
import { CgArrowsBreakeV, CgArrowsShrinkV } from "react-icons/cg";
import { useEffectiveItems } from "@/states/json";
import { useToggleSingle } from "@/states/view";

const NarrowSubtreeButton = (props: {
  isNarrowed: boolean;
  item: JsonRowItem;
  allItems: JsonRowItem[];
  toggleSingleHook: ReturnType<typeof useToggleSingle>;
  manipulationHook: ReturnType<typeof useManipulation>;
}) => {
  if (props.isNarrowed) { return null; }
  const { pushNarrowedRange } = props.manipulationHook;
  const { toggleItem } = props.toggleSingleHook;
  return (<p>
    <IconButton
      icon={CgArrowsShrinkV}
      alt="この要素以下だけを表示する(ナローイング)"
      onClick={() => {
        pushNarrowedRange(props.item.index, props.allItems);
        // 閉じているなら開く
        toggleItem(props.item, false);
      }}
    />
  </p>);
}

const UnnarrowSubtreeButton = (props: {
  isNarrowed: boolean;
  item: JsonRowItem;
  allItems: JsonRowItem[];
  manipulationHook: ReturnType<typeof useManipulation>;
}) => {
  if (!props.isNarrowed) { return null; }
  const { popNarrowedRange } = props.manipulationHook;

  return (<p className="button-unnarrow">
    <IconButton
      icon={CgArrowsBreakeV}
      alt="ナローイングを解除する"
      onClick={() => popNarrowedRange(-1)}
    />
  </p>);
}

/**
 * コンテナ行のホバーメニュー.
 *
 * ナローイングと解除だけを置く: 掘る → 戻るを繰り返す中心操作なので, ここだけは
 * 1クリックで済ませたい。それ以外の行の操作はキーメニュー (KeyMenu) に集約している。
 * ナローイング自体もキーメニューにあり, そちらは祖先の段にも効く。
 */
export const SubtreeMenuCell = (props: {
  item: JsonRowItem;
  isHovered: boolean;
  toggleSingleHook: ReturnType<typeof useToggleSingle>;
  manipulationHook: ReturnType<typeof useManipulation>;
}) => {
  const { manipulation } = props.manipulationHook;
  const flatJsons = useEffectiveItems();
  const isNarrowed = _.last(manipulation.narrowedRanges)?.from === props.item.index;
  // ルートへのナローイングは全体表示と同じで, スタックに何も見えない段が積まれるだけ
  const isRoot = props.item.rowItems.length === 0;
  if (!flatJsons || (!props.isHovered && !isNarrowed)) { return null; }

  return (<div
    className="subtree-menu grow-0 shrink-0 flex flex-row items-center p-1 gap-1 text-sm"
  >
    {!isRoot && <NarrowSubtreeButton
      isNarrowed={isNarrowed} item={props.item} allItems={flatJsons!.items}
      toggleSingleHook={props.toggleSingleHook}
      manipulationHook={props.manipulationHook}
    />}
    <UnnarrowSubtreeButton
      isNarrowed={isNarrowed} item={props.item} allItems={flatJsons!.items}
      manipulationHook={props.manipulationHook}
    />
  </div>);
}

export const SubtreeStatCell = (props: {
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
