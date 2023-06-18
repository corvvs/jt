import { flattenJson } from '@/libs/jetson';
import { atom, useAtom } from 'jotai';

const defaultRawText = `
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

const rawTextAtom = atom<string>(defaultRawText);

const baseTextAtom = atom<string>(defaultRawText);

const jsonAtom = atom(
  (get) => {
    try {
      return JSON.parse(get(baseTextAtom).replace(/[\u0000-\u0019]+/g, ""));
    } catch (e) {
      console.error(e);
      return null;
    }
  }
);

const jsonFlattenedAtom = atom(
  (get) => {
    try {
      return flattenJson(get(jsonAtom), get(baseTextAtom))
    } catch (e) {
      console.error(e);
      return null;
    }
  },
);

/**
 * JSONフック
 * – rawText: テキストエリアの生テキスト
 * - baseText: ある時点での rawText のスナップショット
 * - json: JSON.parse(baseText) の結果得られるもの
 */
export const useJSON = () => {
  const [rawText, setRawtext] = useAtom(rawTextAtom);
  const [, setBaseText] = useAtom(baseTextAtom);
  const [flatJsons] = useAtom(jsonFlattenedAtom);
  return {
    rawText,
    setRawtext,
    setBaseText,
    flatJsons,
  };
};
