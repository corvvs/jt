import { JsonRowItem } from "@/libs/jetson";
import _ from "lodash";
import { usePreference } from "@/states/preference";
import { useManipulation } from "@/states/manipulation";
import { IconButton } from "@/components/lv1/IconButton";
import { CgArrowsBreakeV, CgArrowsShrinkV } from "react-icons/cg";
import { VscCopy } from "react-icons/vsc";
import { useJSON } from "@/states";
import { ClipboardAccess } from "@/libs/sideeffect";
import { toast } from "react-toastify";
import { useToggleSingle } from "@/states/view";

const CopySubtreeButton = (props: {
  item: JsonRowItem;
  rawJson: any;
}) => {
  return (<p>
    <IconButton
      icon={VscCopy}
      alt="この要素以下をJSONとしてクリップボードにコピーする"
      onClick={async () => {
        const { rawJson } = props;
        const keyPath = props.item.elementKey;
        const subJson = keyPath ? _.get(rawJson, keyPath) : rawJson;
        if (!subJson) { return; }
        const subText = JSON.stringify(subJson, null, 2);
        try {
          await ClipboardAccess.copyText(subText);
          toast(`キーパス ${keyPath} 以下のJSONをクリップボードにコピーしました`);
        } catch (e) {
          console.error(e);
        }
      }}
    />
  </p>);
}

const NarrowSubtreeButton = (props: {
  isNarrowed: boolean;
  item: JsonRowItem;
  allItems: JsonRowItem[];
  toggleSingleHook: ReturnType<typeof useToggleSingle>;
  manipulationHook: ReturnType<typeof useManipulation>;
}) => {
  if (props.isNarrowed) { return null; }
  const { pushNarrowedRange } = props.manipulationHook;
  const { toggleItem, toggleState } = props.toggleSingleHook;
  return (<p>
    <IconButton
      icon={CgArrowsShrinkV}
      alt="この要素以下だけを表示する(ナローイング)"
      onClick={() => {
        pushNarrowedRange(props.item.index, props.allItems);
        if (toggleState[props.item.index]) {
          toggleItem(props.item, false);
        }
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

export const SubtreeMenuCell = (props: {
  item: JsonRowItem;
  isHovered: boolean;
  toggleSingleHook: ReturnType<typeof useToggleSingle>;
  manipulationHook: ReturnType<typeof useManipulation>;
}) => {
  const { manipulation } = props.manipulationHook;
  const { json, flatJsons } = useJSON();
  const isNarrowed = _.last(manipulation.narrowedRanges)?.from === props.item.index;
  if (!json || json.status !== "accepted" || !props.isHovered && !isNarrowed) { return null; }
  const rawJson = json.json;

  return (<div
    className="subtree-menu grow-0 shrink-0 flex flex-row items-center p-1 gap-1 text-sm"
  >
    <CopySubtreeButton item={props.item} rawJson={rawJson} />
    <NarrowSubtreeButton
      isNarrowed={isNarrowed} item={props.item} allItems={flatJsons!.items}
      toggleSingleHook={props.toggleSingleHook}
      manipulationHook={props.manipulationHook}
    />
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
