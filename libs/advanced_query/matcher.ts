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

export function matchByQuery(
  item: JsonRowItem,
  query: GroupedQuery | Query | KeyPathQuery | ValueQuery
): boolean {
  if (query.type === "GroupedQuery") {


    if (query.op === "and") {
      return query.queries.every((q) => matchByQuery(item, q));
    }
    if (query.op === "or") {
      return query.queries.some((q) => matchByQuery(item, q));
    }
    console.error("SOMETHING WRONG!!!");


  } else if (query.type === "Query") {


    return  (query.keyPathQuery ? matchByQuery(item, query.keyPathQuery) : true) &&
            (query.valueQuery ? matchByQuery(item, query.valueQuery) : true);


  } else if (query.type === "KeyPathQuery") {


    // こいつが本体
    let atIndex = query.tokens.findIndex(t => t.position === "@");
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
    return matchedFormer && (latter.length === 0 ? true : matchSubtreeByKeyQueries(item, latter, 0));


  } else if (query.type === "ValueQuery") {


    // まだ Key 1つだけしか対応してない
    if (query.tokens.length >= 1) {
      return item.right.value?.toString() === query.tokens[0].token;
    }
    console.error("SOMETHING WRONG???");


  } else {


    console.error("SOMETHING WRONG...");


  }


  return false;
}
