import { useManipulation } from "@/states/manipulation";
import _ from "lodash";
import { InlineIcon } from "../lv1/InlineIcon";
import { VscCopy } from "react-icons/vsc";
import { extractFilteredResult } from "@/libs/partial_tree";
import { useJSON } from "@/states";
import { ClipboardAccess } from "@/libs/sideeffect";
import { toast } from "react-toastify";
import { useVisibleItems } from "@/states/json";

const HitCounter = () => {
  const { filterMaps } = useManipulation();
  if (!filterMaps) { return null }
  const hitCount = _.size(filterMaps.matched);

  return <p className={`filter-matched-items ${hitCount > 0 ? "" : "no-hit"}`}>
    {hitCount}
    <span className="text-sm">items</span>
  </p>
};

const CopyResultsBlock = () => {
  const { 
    filteringPreference,
    filterMaps,
  } = useManipulation();
  const {
    json,
  } = useJSON();
  const visibles = useVisibleItems();
  if (!filterMaps) { return null; }
  const hitCount = _.size(filterMaps.matched);
  if (hitCount === 0 || !visibles || json?.status !== "accepted") { return null; }

  const copyDescription = {
    "ascendant_descendant": "表示範囲をコピー",
    "ascendant":            "表示範囲をコピー",
    "descendant":           "表示範囲を配列としてコピー",
    "just":                 "表示範囲を配列としてコピー",
  }[filteringPreference.resultAppearance];

  return <div
    className="flex flex-row justify-between items-center"
  >
    <h3
      className="font-bold text-sm"
    >
      結果をコピー
    </h3>

    <div>
      <button
        title={copyDescription}
        className={
          `flippable h-[2.4em] py-1 whitespace-nowrap break-keep`
        }
        onClick={async () => {
          const partialJson = extractFilteredResult(
            filteringPreference.resultAppearance,
            json.json,
            visibles.filteredItems,
            filterMaps
          );
          if (!partialJson) { return; }
          const partialText = JSON.stringify(partialJson, null, 2);
          try {
            await ClipboardAccess.copyText(partialText);
            toast(`表示結果のJSONをクリップボードにコピーしました`);
          } catch (e) {
            console.error(e);
          }
        }}
      >
        <InlineIcon i={<VscCopy />} />
        <span>{ copyDescription }</span>
      </button>
    </div>

  </div>;
};

export const HitCard = () => {
  return <>
    <HitCounter />

    <CopyResultsBlock />
  </>
};
