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
  elementKey: string;
  right: JsonValueObject;
  rowItems: JsonRowItem[];
  stats: TreeStats;
  childs?: JsonRowItem[];
  itemKey?: string | number;

  previousSibling?: JsonRowItem;
  parent?: JsonRowItem;
  nextSibling?: JsonRowItem;
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
    if (gaugeStats.columnKeyLengths.length < depth + 1) {
      while (gaugeStats.columnKeyLengths.length < depth + 1) {
        gaugeStats.columnKeyLengths.push([]);
        gaugeStats.columnIndexLengths.push([]);
        if (gaugeStats.columnKeyLengths.length <= item.rowItems.length) {
          const i = gaugeStats.columnKeyLengths.length - 1;
          pushColumnLength(gaugeStats, item.rowItems[i]);
        }
      }
    }
    pushColumnLength(gaugeStats, item);
  }
  // 各列の幅を調整する
  const maxKeyLengths = gaugeStats.columnKeyLengths.map((kls, i) => {
    // インデックス
    const ils = gaugeStats.columnIndexLengths[i];
    const imax = ils.length > 0 ? Math.max(...ils) : 0;
    // キー
    const kvmax = kls.length > 0 ? Math.max(...kls) : 0;
    const kmean = kls.length > 0 ? kls.reduce((s, a) => s + a, 0) / kls.length : 0;
    const ksigma = kls.length > 0 ? Math.sqrt(kls.reduce((s, a) => s + (a - kmean) ** 2, 0) / kls.length) : 0;
    const kmax = (kvmax - kmean) / ksigma < 0.5 ? kvmax : kmean + ksigma;

    return Math.ceil(Math.max(kmax + 2, imax + 3));
  });
  const gauge: JsonGauge = {
    maxKeyLengths,
    crampedKeyLengths: maxKeyLengths.map(x => Math.max(4, Math.min(x, 18))),
  };
  return gauge;
}

