import _ from "lodash";
import { JsonRowItem } from "../jetson";
import { GroupedQuery, KeyPathQuery, KeyQuery, Query, ValueQuery } from "./types";

function matchSubtreeByKeyQueries(item: JsonRowItem, queries: KeyQuery[], i: number): boolean {
  if (i < 0 || queries.length <= i) { return true; }
  const q = queries[i];
  // q と item.childs が戦う
  if (!item.childs) { return false; }
  return item.childs.some(child => {
    if (!matchByKeyQuery(child, q)) { return false; }
    return matchSubtreeByKeyQueries(child, queries, i + 1);
  });
}

function matchByKeyQuery(
  item: JsonRowItem,
  keyQuery: KeyQuery,
) {
  if (keyQuery.string) {
    if (typeof item.itemKey === "undefined") {
      return false;
    }
    const stringifiedItemKey = item.itemKey.toString();
    const rex = new RegExp(
      "^" +
      keyQuery.string.token
        .replaceAll(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replaceAll("*", ".*") +
      "$"
    );
    if (!stringifiedItemKey.match(rex)) {
      return false;
    }
  }
  return true;
}

function hasAtSymbol(keyPathQuery: KeyPathQuery): boolean {
  return keyPathQuery.tokens.some(token => token.position === "@");
}

function matchValueQueryInSubtree(item: JsonRowItem, valueQuery: ValueQuery): boolean {
  // 子孫ノードすべてをチェック
  function checkDescendants(node: JsonRowItem): boolean {
    // 現在のノードでValueQueryをチェック
    if (matchValueQueryDirect(node, valueQuery)) {
      return true;
    }
    
    // 子ノードがあれば再帰的にチェック
    if (node.childs) {
      return node.childs.some(child => checkDescendants(child));
    }
    
    return false;
  }
  
  return checkDescendants(item);
}

function matchValueQueryDirect(item: JsonRowItem, valueQuery: ValueQuery): boolean {
  // まだ Key 1つだけしか対応してない
  if (valueQuery.tokens.length >= 1) {
    return item.right.value?.toString() === valueQuery.tokens[0].token;
  }
  return false;
}

export function matchByQuery(
  item: JsonRowItem,
  query: GroupedQuery | Query | KeyPathQuery | ValueQuery,
  level: number = 0,
): boolean {
  switch (query.type) {
  case "GroupedQuery": {
  
    switch (query.op) {
      case "and":
        return query.queries.every((q) => matchByQuery(item, q, level + 1));
      case "or":
        return query.queries.some((q) => matchByQuery(item, q, level + 1));
    }
    console.error("SOMETHING WRONG!!!");
    break;
  } 
  case "Query": {

    // KeyPathQueryに@が含まれているかチェック
    if (query.keyPathQuery && hasAtSymbol(query.keyPathQuery)) {
      // @が含まれる場合：KeyPathQueryで対象ノードを特定し、ValueQueryを子孫に適用
      const keyPathMatched = matchByQuery(item, query.keyPathQuery, level + 1);
      if (!keyPathMatched) {
        return false;
      }
      
      // ValueQueryがある場合は子孫ノードで適用
      if (query.valueQuery) {
        return matchValueQueryInSubtree(item, query.valueQuery);
      }
      
      return true;
    } else {
      // @が含まれない場合：従来通りのAND条件
      return  (query.keyPathQuery ? matchByQuery(item, query.keyPathQuery, level + 1) : true) &&
              (query.valueQuery ? matchByQuery(item, query.valueQuery, level + 1) : true);
    }
  } 
  case "KeyPathQuery": {


    // こいつが本体
    const atIndex = query.tokens.findIndex(t => t.position === "@");
    const formerSize = atIndex < 0 ? query.tokens.length : atIndex + 1;
    const former = _.slice(query.tokens, 0, formerSize);
    const latter = _.slice(query.tokens, formerSize);


    // - former: 要素のキーパスに後方一致するべき KeyQuery 列
    // - latter: 要素を部分木とする部分木に含まれるべきキーパスを表す KeyQuery 列

    const matchedFormer = former.length === 0 ? true : (item => {
      // まず末尾要素がマッチするかどうかを確かめる
      let fi = former.length - 1;
      let ki = item.rowItems.length;
      if (!matchByKeyQuery(item, former[fi])) { return false; }
      fi -= 1;
      ki -= 1;
      for (; 0 <= fi; fi -= 1, ki -= 1) {
        // 遡って1つずつマッチを確認する
        if (ki < 0) { return false; }
        const it = item.rowItems[ki];
        const q = former[fi];
        if (!matchByKeyQuery(it, q)) { return false; }
        if (q.position === "$" && ki !== 0) { return false; }
      }
      return true;
    })(item);

    if (!matchedFormer) {
      return false;
    }
    if (latter.length === 0) {
      return true;
    }
    return matchSubtreeByKeyQueries(item, latter, 0);
  }
  case "ValueQuery": {
    return matchValueQueryDirect(item, query);
  }
  default: 
    console.error("SOMETHING WRONG...");
  }


  return false;
}
