import _ from "lodash";
import { JsonRowItem } from "./jetson";
import { FilteringMap, FilteringResultAppearanceOption } from "@/states/manipulation/query";

export function extractSubtree(
  rawJson: any,
  keyPath: string,
) {
  const subJson = keyPath ? _.get(rawJson, keyPath) : rawJson;
  return subJson;
}

function extractFiltetedPartialTree(
  item: JsonRowItem,
  filteringMap: FilteringMap,
  parent_stack: any[],
) {
  const index = item.index;
  if (!filteringMap.visible[index]) { return null; }

  const parent = _.last(parent_stack);
  const isMap = item.right.type === "map";
  const isArray = item.right.type === "array";
  const value: any = isMap
    ? {}
    : isArray
      ? []
      : item.right.value;
  if (parent) {
    // もし親が存在するなら, 自分を親にしかるべきキーでセットする.
    if (typeof item.itemKey === "string") {
      parent[item.itemKey] = value;
    } else if (typeof item.itemKey === "number") {
      parent.push(value);
    } else {
      throw new Error("something wrong");
    }
  }
  // もし自分がコンテナ型であれば, 再帰的に呼び出す
  if (isMap || isArray) {
    parent_stack.push(value);
    for (const subitem of item.childs!) {
      extractFiltetedPartialTree(subitem, filteringMap, parent_stack);
    }
    parent_stack.pop();
  }
  return value;
}

export function extractFiltetedSubtrees(
  resultAppearance: FilteringResultAppearanceOption,
  rawJson: any,
  items: JsonRowItem[],
  filteringMap: FilteringMap,
) {
  const subtrees: any[] = [];
  for (const item of items) {
    const index = item.index;
    if (!filteringMap.matched[index]) { continue; }
    const isMap = item.right.type === "map";
    const isArray = item.right.type === "array";
    const value: any = resultAppearance === "descendant"
      ? _.get(rawJson, item.elementKey)
      : isMap
        ? {}
        : isArray
          ? []
          : item.right.value;
    subtrees.push(value);
  }
  return subtrees;
}

export function extractFilteredResult(
  resultAppearance: FilteringResultAppearanceOption,
  rawJson: any,
  items: JsonRowItem[],
  filteringMap: FilteringMap,
) {
  switch (resultAppearance) {
    case "ascendant_descendant":
    case "ascendant": {
      const root = items[0];
      const partialTree = extractFiltetedPartialTree(root, filteringMap, []);
      console.log("partialTree", partialTree);
      return partialTree;
    }
    case "descendant":
    case "just": {
      return extractFiltetedSubtrees(resultAppearance, rawJson, items, filteringMap);
    }
  }
  return null;
}

