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

export type JsonRowItem = {
  index: number;
  lineNumber: number;
  elementKey: string;
  right: JsonValueObject;
  rowItems: JsonRowItem[];
  stats: TreeStats;
  childs?: JsonRowItem[];
  itemKey?: string | number;
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

function flattenDigger(
  subtree: JsonValueObject,
  items: JsonRowItem[],
  branch: JsonRowItem[],
  stats: JsonStats,
  parent?: {
    elementKey: string;
    item: JsonRowItem;
    itemKey: string | number;
  }
): void {
  const elementKey = typeof parent?.elementKey === "string"
    ? (parent.elementKey.length > 0
      ? parent.elementKey + "." + `${parent.itemKey ?? items.length}`
      : `${parent.itemKey ?? items.length}`
    ) : "";
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
  };
  items.push(item);

  stats.item_count += 1;
  const depth = branch.length;
  item.rowItems.forEach((rowItem, d) => {
    rowItem.stats.item_count += 1;
    if (rowItem.stats.max_depth < depth - d) {
      rowItem.stats.max_depth = depth - d;
    }
  });

  if (stats.max_depth < depth) {
    stats.max_depth = depth;
  }
  if (stats.max_key_length.length < depth + 1) {
    stats.max_key_length.push(0);
  }
  if (stats.max_key_length[depth] < elementKey.length) {
    stats.max_key_length[depth] = elementKey.length;
  }

  switch (subtree.type) {
    case "string": {
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
    case "array": {
      parent?.item.childs?.push(item);

      item.childs = [];
      branch.push(item);
      subtree.value.forEach((value, index) => {
        flattenDigger(value, items, branch, stats, { item, itemKey: index, elementKey });
      });
      branch.pop();
      break;
    }
    case "map": {
      parent?.item.childs?.push(item);
      item.childs = [];

      branch.push(item);
      _.forEach(subtree.value, (value, itemKey) => {
        flattenDigger(value, items, branch, stats, { item, itemKey, elementKey });
      });
      branch.pop();
      break;
    }
  }
}

export function flattenJson(json: any, rawText: string) {
  const tree = makeVOTree(json);
  const items: JsonRowItem[] = [];
  const branch: JsonRowItem[] = [];
  const stats: JsonStats = {
    item_count: 0,
    max_depth: 0,
    max_key_length: [],
    char_count: rawText.length,
  };
  flattenDigger(tree, items, branch, stats);
  return {
    items,
    stats,
  };
}
