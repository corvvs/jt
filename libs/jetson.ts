import _ from "lodash";

export type JsonValueObjectString = {
	type: "string";
	value: string;
};

export type JsonValueObjectNumber = {
	type: "number";
	value: number;
};

export type JsonValueObjectBoolean = {
	type: "boolean";
	value: boolean;
};

export type JsonValueObjectNull = {
	type: "null";
	value: null;
};

export type JsonValueObjectArray = {
	type: "array";
	value: JsonValueObject[];
};

export type JsonValueObjectMap = {
	type: "map";
	value: { [itemKey: string]: JsonValueObject };
};

export type JsonValueObject = 
  | JsonValueObjectString
  | JsonValueObjectNumber
  | JsonValueObjectBoolean
  | JsonValueObjectNull
  | JsonValueObjectArray
  | JsonValueObjectMap;

type TreeStats = {
  item_count: number;
  max_depth: number;
};

export type JsonStats = TreeStats & {
  max_key_length: number[];
  char_count: number;
};

export type GaugeStats = {
  /**
   * objectフィールドにおけるキーの長さ
   */
  columnKeyLengths: number[][];
  /**
   * arrayフィールドにおけるインデックスの長さ
   */
  columnIndexLengths: number[][];
};

export type JsonGauge = {
  maxKeyLengths: number[];
  crampedKeyLengths: number[];
};

export type JsonRowItem = {
  index: number;
  lineNumber: number;
  /**
   * JSON多分木における自ノードのキー名
   */
  elementKey: string;
  /**
   * このノードをサブルートとした時のJSON値
   */
  right: JsonValueObject;
  /**
   * ルートからこのノードの親までの経路上にあるノードの配列
   */
  rowItems: JsonRowItem[];
  stats: TreeStats;
  /**
   * 子ノード
   */
  childs?: JsonRowItem[];
  itemKey?: string | number;

  /**
   * JSON多分木のノードを一列に並べた時, 自分と同じ親を持つ自分の直前のノード
   */
  previousSibling?: JsonRowItem;
  /**
   * 親ノード
   */
  parent?: JsonRowItem;
  /**
   * JSON多分木のノードを一列に並べた時, 自分と同じ親を持つ自分の直後のノード
   */
  nextSibling?: JsonRowItem;
  /**
   * nextSibling があるならそれと同じ, ない場合は親の nextSiblingOrParent と同じ
   */
  nextSiblingOrParent?: JsonRowItem;
  /**
   * 整形済みの値かどうか
   * もしも整形済みであれば, それに忠実に表示してもよい
   */
  isPreformattedValue?: boolean;
};

function makeVOTree(subtree: any): JsonValueObject {
  if (typeof subtree === "string") {
    return {
      type: "string",
      value: subtree,
    };
  } else if (typeof subtree === "number") {
    return {
      type: "number",
      value: subtree,
    };
  } else if (typeof subtree === "boolean") {
    return {
      type: "boolean",
      value: subtree,
    };
  } else if (_.isNull(subtree)) {
    return {
      type: "null",
      value: null,
    };
  } else if (_.isArray(subtree)) {
    return {
      type: "array",
      value: subtree.map((value) => makeVOTree(value)),
    };
  } else if (typeof subtree === "object") {
    return {
      type: "map",
      value: _.mapValues(subtree, (value) => makeVOTree(value)),
    };
  } else {
    throw new Error("unreachable");
  }
}

// 値が整形済みかどうかを判定するための正規表現
const RegexpIsPreformattedValue = /[\n\r\t](?!$)/;

/**
 * `flattenJson` の補助関数.
 * JsonValueObject からなるツリー構造を再帰的にたどり, JsonRowItem の配列に変換する.
 */
function flattenDigger(
  subtree: JsonValueObject,
  items: JsonRowItem[],
  branch: JsonRowItem[],
  jsonStats: JsonStats,
  parent?: {
    elementKey: string;
    item: JsonRowItem;
    itemKey: string | number;
  }
): JsonRowItem {
  const parentIsContainer = typeof parent?.elementKey === "string";
  const ownKey = parentIsContainer
    ? `${parent.itemKey ?? items.length}`
    : "";

  const elementKey = parentIsContainer
    ? (parent.elementKey.length > 0
      ? parent.elementKey + "." + ownKey
      : ownKey
    ) : "";
  /**
   * **全体**インデックス
   */
  const index = items.length;
  const lineNumber = items.length + 1;
  const item: JsonRowItem = {
    index,
    lineNumber,
    elementKey,
    right: subtree,
    rowItems: [...branch],
    stats: {
      item_count: 1,
      max_depth: 0,
    },
    itemKey: parent?.itemKey,
    parent: parent?.item,
  };
  items.push(item);

  jsonStats.item_count += 1;
  const depth = branch.length;
  item.rowItems.forEach((rowItem, d) => {
    rowItem.stats.item_count += 1;
    if (rowItem.stats.max_depth < depth - d) {
      rowItem.stats.max_depth = depth - d;
    }
  });

  if (jsonStats.max_depth < depth) {
    jsonStats.max_depth = depth;
  }
  if (jsonStats.max_key_length.length < depth + 1) {
    jsonStats.max_key_length.push(0);
  }
  if (jsonStats.max_key_length[depth] < elementKey.length) {
    jsonStats.max_key_length[depth] = elementKey.length;
  }

  switch (subtree.type) {
    case "string": {
      // isPreformattedValue の可能性をチェック
      item.isPreformattedValue = RegexpIsPreformattedValue.test(subtree.value);
      parent?.item.childs?.push(item);
      break;
    }
    case "number": {
      parent?.item.childs?.push(item);
      break;
    }
    case "boolean": {
      parent?.item.childs?.push(item);
      break;
    }
    case "null": {
      parent?.item.childs?.push(item);
      break;
    }
    // 以上, 葉ノード
    // 以下, 葉ノードではない
    case "array": {
      parent?.item.childs?.push(item);

      item.childs = [];
      branch.push(item);
      const children = subtree.value
        .map((value, index) => flattenDigger(value, items, branch, jsonStats, { item, itemKey: index, elementKey }));
      for (let i = 1; i < children.length; ++i) {
        children[i - 1].nextSibling = children[i];
        children[i].previousSibling = children[i - 1];
      }
      branch.pop();
      break;
    }
    case "map": {
      parent?.item.childs?.push(item);
      item.childs = [];

      branch.push(item);
      const children = _.map(
        subtree.value,
        (value, itemKey) => flattenDigger(value, items, branch, jsonStats, { item, itemKey, elementKey })
      );
      for (let i = 1; i < children.length; ++i) {
        children[i - 1].nextSibling = children[i];
        children[i].previousSibling = children[i - 1];
      }
      branch.pop();
      break;
    }
  }
  return item;
}

export function flattenJson(json: any, rawText: string) {
  const tree = makeVOTree(json);
  const items: JsonRowItem[] = [];
  const branch: JsonRowItem[] = [];

  const jsonStats: JsonStats = {
    item_count: 0,
    max_depth: 0,
    max_key_length: [],
    char_count: rawText.length,
  };
  flattenDigger(tree, items, branch, jsonStats);
  for (const item of items) {
    // NOTE: itemsが 親 → 子 の順に並んでいることを利用している
    item.nextSiblingOrParent = item.nextSibling ?? item.parent?.nextSiblingOrParent;
  }

  return {
    items,
    stats: jsonStats,
  };
}

function pushColumnLength(gaugeStats: GaugeStats, item: JsonRowItem) {
  const depth = item.rowItems.length;
  if (typeof item.itemKey !== "undefined") {
    if (typeof item.itemKey === "number") {
      gaugeStats.columnIndexLengths[depth].push(item.itemKey.toString().length);
    } else if (typeof item.itemKey === "string") {
      gaugeStats.columnKeyLengths[depth].push(item.itemKey.length);
    }
  }
}

export function makeGauge(items: JsonRowItem[]) {
  const gaugeStats: GaugeStats = {
    columnKeyLengths: [],
    columnIndexLengths: [],
  };
  // 各列の幅を収集する
  for (const item of items) {
    const depth = item.rowItems.length;
    while (gaugeStats.columnKeyLengths.length <= depth) {
      gaugeStats.columnKeyLengths.push([]);
      gaugeStats.columnIndexLengths.push([]);
      if (gaugeStats.columnKeyLengths.length <= item.rowItems.length) {
        const i = gaugeStats.columnKeyLengths.length - 1;
        pushColumnLength(gaugeStats, item.rowItems[i]);
      }
    }
    pushColumnLength(gaugeStats, item);
  }
  // 各列の幅を調整する
  const maxKeyLengths = gaugeStats.columnKeyLengths.map((kls, i) => {
    // インデックス長
    const ils = gaugeStats.columnIndexLengths[i];
    let ilmax = 0;
    for (const x of ils) {
      if (ilmax < x) { ilmax = x; }
    }
    // キー
    let kvmax = 0;
    let kmean = 0;
    let k2mean = 0;
    for (const x of kls) {
      if (kvmax < x) { kvmax = x; }
      kmean += x;
      k2mean += x ** 2;
    }
    kmean = kls.length > 0 ? kmean / kls.length : 0;
    k2mean = kls.length > 0 ? k2mean / kls.length : 0;
    const ksigma = Math.sqrt(k2mean - kmean ** 2);
    const kmax = (kvmax - kmean) / ksigma < 0.5 ? kvmax : kmean + ksigma;
    return Math.ceil(Math.max(kmax + 2, ilmax + 3));
  });
  const gauge: JsonGauge = {
    maxKeyLengths,
    crampedKeyLengths: maxKeyLengths.map(x => Math.max(4, Math.min(x, 18))),
  };
  return gauge;
}

