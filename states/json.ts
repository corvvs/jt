import { JsonText } from '@/data/text';
import { JsonGauge, JsonRowItem, flattenJson } from '@/libs/jetson';
import { atom, useAtom } from 'jotai';
import { useMemo } from 'react';
import { useToggleState } from './view';
import { useManipulation } from './manipulation';
import _ from 'lodash';

export const defaultRawText = `
{
  "types":["sublocality","political"],
  "formatted_address":"Winnetka, California, USA",
  "address_components":[{
    "long_name":"Winnetka",
    "short_name":"Winnetka",
    "types":["sublocality","political"]
  },{
    "long_name":"Los Angeles",
    "short_name":"Los Angeles",
    "types":["administrative_area_level_3","political"]
  },{
    "long_name":"Los Angeles",
    "short_name":"Los Angeles",
    "types":["administrative_area_level_2","political"]
  },{
    "long_name":"California",
    "short_name":"CA",
    "types":["administrative_area_level_1","political"]
  },{
    "long_name":"United States",
    "short_name":"US",
    "types":["country","political"]
  }],
  "geometry":{
    "location": [34.213171,-118.571022],
    "location_type":"APPROXIMATE"
  },
  "place_id": "ChIJ0fd4S_KbwoAR2hRDrsr3HmQ"
}
`

/**
 * 編集エリアのテキスト
 */
const rawTextAtom = atom<string>("null");

/**
 * JSON変換を行う対象のテキスト
 */
const baseTextAtom = atom<string>("null");

const parsedJsonAtom = atom<any | null>(null);

const parseJson = (baseText: string) => {
  const text = baseText.replace(/[\u0000-\u0019]+/g, "");
  const json = JSON.parse(text);
  JsonText.saveTextLocal(baseText);
  return json;
}

export const jsonFlattenedAtom = atom(
  (get) => {
    try {
      const json = get(parsedJsonAtom);
      if (!json) { return null; }
      return flattenJson(json, get(baseTextAtom))
    } catch (e) {
      console.error(e);
      return null;
    }
  },
);

export const useVisibleItems = () => {
  const { flatJsons } = useJSON();
  const { toggleState } = useToggleState();
  const { manipulation, simpleFilterMaps } = useManipulation();

  return useMemo((): { visibleItems: JsonRowItem[], gauge: JsonGauge } | null => {
    if (!flatJsons) { return null; }
    const { items } = flatJsons;
  
    // 表示すべきitemを選別する
    const filterBySimpleFilteringQuery = simpleFilterMaps
      ? (item: JsonRowItem) => simpleFilterMaps.visible[item.index]
      : () => true;
  
    const topNarrowingRange = _.last(manipulation.narrowedRanges);
    const filterByNarrowing = topNarrowingRange
      ? (item: JsonRowItem) => {
          const { from, to } = topNarrowingRange;
          return from <= item.index && item.index < to;
        }
      : () => true;
    const visibleItems = (() => {
      return items
        .filter(filterByNarrowing)
        .filter(filterBySimpleFilteringQuery)
        .filter((item) => !item.rowItems.some((rowItem) => toggleState[rowItem.index]));
    })();
    return {
      visibleItems,
      gauge: flatJsons.gauge,
    };
  }, [flatJsons, toggleState, manipulation, simpleFilterMaps]);
};

/**
 * JSONフック
 * – rawText: テキストエリアの生テキスト
 * - baseText: ある時点での rawText のスナップショット
 * - json: JSON.parse(baseText) の結果得られるもの
 */
export const useJSON = () => {
  const [rawText, setRawtext] = useAtom(rawTextAtom);
  const [baseText, setBaseText] = useAtom(baseTextAtom);
  const [flatJsons] = useAtom(jsonFlattenedAtom);
  const [json, setParsedJson] = useAtom(parsedJsonAtom);
  return {
    rawText,
    setRawtext,
    setBaseText,
    flatJsons,
    json,
    parseJson,
    setParsedJson,
  };
};
