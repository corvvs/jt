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

export const SubtreeMenuCell = (props: {
  item: JsonRowItem;
}) => {
  const { manipulation, setManipulation, setNarrowedRange, unsetNarrowdRange } = useManipulation();
  const { json, flatJsons } = useJSON();
  if (manipulation.selectedIndex !== props.item.index) { return null; }
  const isNarrowed = manipulation.narrowedRange?.from === props.item.index;

  return (<div
    className="grow-0 shrink-0 flex flex-row items-center p-1 gap-1 text-sm"
  >
    <p>
      <IconButton
        icon={VscCopy}
        alt="この要素以下をJSONとしてクリップボードにコピーする"
        onClick={async () => {
          const keyPath = props.item.elementKey;
          const subJson = keyPath ? _.get(json, keyPath) : json;
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
    </p>

    {
      isNarrowed ? null : <p>
        <IconButton
          icon={CgArrowsShrinkV}
          alt="この要素以下だけを表示する(ナローイング)"
          onClick={() => setNarrowedRange(props.item.index, flatJsons!.items)}
        />
      </p>
    }

    {
      isNarrowed ? <p>
        <IconButton
          icon={CgArrowsBreakeV}
          alt="ナローイングを解除する"
          onClick={() => unsetNarrowdRange()}
        />
      </p> : null
    }
  </div>)
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
