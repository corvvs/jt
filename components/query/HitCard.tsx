import { useManipulation } from "@/states/manipulation";
import _ from "lodash";
import { InlineIcon } from "../lv1/InlineIcon";
import { VscCopy, VscCloudDownload } from "react-icons/vsc";
import { extractFilteredResult } from "@/libs/partial_tree";
import { useJSON } from "@/states";
import { ClipboardAccess, FileDownload } from "@/libs/sideeffect";
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
    "lightup":              "ヒット範囲を配列としてコピー",
  }[filteringPreference.resultAppearance];

  const downloadDescription = {
    "ascendant_descendant": "表示範囲をダウンロード",
    "ascendant":            "表示範囲をダウンロード",
    "descendant":           "表示範囲を配列としてダウンロード",
    "just":                 "表示範囲を配列としてダウンロード",
    "lightup":              "ヒット範囲を配列としてダウンロード",
  }[filteringPreference.resultAppearance];

  const getPartialJson = () => {
    return extractFilteredResult(
      filteringPreference.resultAppearance,
      json.json,
      visibles.filteredItems,
      filterMaps
    );
  };

  return <div
    className="flex flex-col gap-2"
  >
    <div className="flex flex-row justify-between items-center">
      <h3
        className="font-bold text-sm"
      >
        フィルター結果を:
      </h3>

      <div className="flex flex-row gap-2">
        <button
          title={copyDescription}
          className={
            `flippable h-[2.4em] py-1 px-2 whitespace-nowrap break-keep`
          }
          onClick={async () => {
            const partialJson = getPartialJson();
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
          <span>コピー</span>
        </button>
        
        <button
          title={downloadDescription}
          className={
            `flippable h-[2.4em] py-1 px-2 whitespace-nowrap break-keep`
          }
          onClick={() => {
            const partialJson = getPartialJson();
            if (!partialJson) { return; }
            try {
              FileDownload.downloadAsJson(partialJson, 'filtered-result.json');
              toast(`表示結果のJSONをダウンロードしました`);
            } catch (e) {
              console.error(e);
            }
          }}
        >
          <InlineIcon i={<VscCloudDownload />} />
          <span>ダウンロード</span>
        </button>
      </div>
    </div>

  </div>;
};

export const HitCard = () => {
  return <>
    <HitCounter />

    <CopyResultsBlock />
  </>
};
