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

export type JsonRowItem = {
  elementKey: string;
  right: JsonValueObject;
  rowItems: JsonRowItem[];
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

function flattenDigger(subtree: JsonValueObject, items: JsonRowItem[], branch: JsonRowItem[], parent?: {
  elementKey: string;
  item: JsonRowItem;
  itemKey: string | number;
}): void {
  const elementKey = parent ? parent.elementKey + "." + (parent.itemKey ?? `(${items.length})`) : `(${items.length})`;
  const item: JsonRowItem = {
    elementKey,
    right: subtree,
    rowItems: [...branch],
    itemKey: parent?.itemKey,
  };
  items.push(item);
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
        flattenDigger(value, items, branch, { item, itemKey: index, elementKey });
      });
      branch.pop();
      break;
    }
    case "map": {
      parent?.item.childs?.push(item);
      item.childs = [];

      branch.push(item);
      _.forEach(subtree.value, (value, itemKey) => {
        flattenDigger(value, items, branch, { item, itemKey, elementKey });
      });
      branch.pop();
      break;
    }
  }
}

export function flattenJson(json: any): JsonRowItem[] {
  const tree = makeVOTree(json);
  const items: JsonRowItem[] = [];
  const branch: JsonRowItem[] = [];
  flattenDigger(tree, items, branch);
  return items;
}
