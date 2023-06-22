import { JsonText } from '@/data/text';
import { JsonGauge, JsonRowItem, flattenJson } from '@/libs/jetson';
import { atom, useAtom } from 'jotai';
import { useMemo } from 'react';
import { useToggleState } from './view';
import { useManipulation } from './manipulation';
import _ from 'lodash';

export const defaultRawText = JSON.stringify({
  "app_name": "JSON Analyzer",
  "version": "alpha",
  "description": "JSONを見やすく表示し、中身の分析を手助けするツールです。",
  "how_to_use": [
    {
      "name": "JSON文字フォームの表示",
      "description": "画面上の\"Edit Text\"ボタンで、入力フォームが開きます。"
    },
    {
      "name": "JSON文字の入力",
      "description": "フォームにJSON文字列を入力し、フォーム左上の「変換」ボタンを押します。"
    },
    {
      "name": "JSONの表示",
      "description": "入力内容にJSONとして問題がなければ、フォームが閉じ、JSONの構造が表示されます。"
    }
  ],
  "features": {
    "folding_array_and_map": {
      "description": "配列型とオブジェクト型の要素は、アイコンボタンにより開閉が可能です。",
      "fold_all_unfold_all": {
        "description": "画面上の\"Fold All\"および\"Unfold All\"ボタンはそれぞれ、表示中の開閉可能な要素すべてを一括して閉じ(開き)ます。"
      }
    },
    "line_selection": {
      "description": "行番号をクリックすると、その行の要素が選択状態になります。もう一度同じ行番号をクリックすると選択が解除されます。",
      "subtree": {
        "description": "選択状態の要素に対してはいくつかの操作が可能です。",
        "copy_as_text": {
          "description": "選択状態の要素以下の部分のみを文字列としてクリップボードにコピーします。"
        },
        "narrowing": {
          "description": "選択状態の要素以下の部分のみを画面に表示します。"
        }
      }
    },
    "simple_filtering": {
      "description": "画面上のテキストフィールドで、表示内容の絞り込みができます。"
    },
    "performance": {
      "description": "数万行程度までのJSONであれば、比較的ストレスなく表示できると思います。"
    }
  },
  "powered_by": {
    "application_framework": "https://nextjs.org/",
    "hosting": "https://vercel.com/"
  },
  "author": {
    "web": "https://corvvs.dev/",
    "github": "https://github.com/corvvs"
  }
}, null, 2);

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
