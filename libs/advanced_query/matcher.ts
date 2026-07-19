import { JsonRowItem } from "../jetson";
import { GroupedQuery, KeyPathQuery, PredicateQuery, Query, SegmentQuery, ValueQuery } from "./types";

/**
 * セグメントパターン → 正規表現のキャッシュ.
 * パターンはクエリ文字列由来なので種類は高々ユーザーが打った数に留まる.
 */
const patternRegexCache = new Map<string, RegExp>();

const patternToRegex = (pattern: string): RegExp => {
  let rex = patternRegexCache.get(pattern);
  if (!rex) {
    rex = new RegExp(
      "^" +
      pattern
        .replaceAll(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replaceAll("*", ".*") +
      "$"
    );
    patternRegexCache.set(pattern, rex);
  }
  return rex;
};

const matchPattern = (itemKey: string | number | undefined, pattern: string): boolean => {
  if (typeof itemKey === "undefined") { return false; }
  return itemKey.toString().match(patternToRegex(pattern)) !== null;
};

/**
 * 値の照合.
 * - 引用形 ("...") : 文字列値との厳密一致 (数値 42 に "42" はマッチしない)
 * - 裸 : toString 比較. 数値・真偽値は文字列表現で比較する. null は token "null" にマッチ
 */
const matchValue = (item: JsonRowItem, valueQuery: ValueQuery): boolean => {
  const value = item.right.value;
  if (valueQuery.quoted) {
    return typeof value === "string" && value === valueQuery.token;
  }
  if (value === null) {
    return valueQuery.token === "null";
  }
  return value?.toString() === valueQuery.token;
};

/**
 * セグメントがノードに合致するか (キー名 + 付随する述語すべて).
 */
const matchSegmentAt = (node: JsonRowItem, segment: SegmentQuery): boolean => {
  if (!matchPattern(node.itemKey, segment.pattern!)) { return false; }
  return (segment.predicates ?? []).every((p) => matchPredicate(node, p));
};

/**
 * 述語: node の部分木が述語のクエリを満たすか.
 * - キーパスなし ([:v]) : node 自身を含む部分木のどこかに値がマッチするノードがある
 * - キーパスあり : チェーンが node の配下に存在する. $ 付きなら node 直下から,
 *   なしなら部分木のどこから始まってもよい. 値はチェーン末端のノードで評価する
 */
const matchPredicate = (node: JsonRowItem, predicate: PredicateQuery): boolean => {
  const { keyPathQuery, valueQuery } = predicate.query;
  if (!keyPathQuery) {
    if (!valueQuery) { return true; }
    return existsInSubtree(node, (d) => matchValue(d, valueQuery));
  }
  if (keyPathQuery.anchored) {
    return matchChainDown(node, keyPathQuery.segments, 0, valueQuery);
  }
  // 非アンカー: 任意の深さだけ潜ってからチェーンを開始してよい (仮想的な先頭 ** と同じ)
  return existsInSubtree(node, (start) => matchChainDown(start, keyPathQuery.segments, 0, valueQuery));
};

const existsInSubtree = (node: JsonRowItem, hit: (d: JsonRowItem) => boolean): boolean => {
  if (hit(node)) { return true; }
  return (node.childs ?? []).some((child) => existsInSubtree(child, hit));
};

/**
 * node の子から下へ segments[si..] のチェーンを辿れるか.
 * チェーン末端のノードで valueQuery を評価する (valueQuery が無ければ到達のみで真).
 */
const matchChainDown = (
  node: JsonRowItem,
  segments: SegmentQuery[],
  si: number,
  valueQuery: ValueQuery | undefined,
): boolean => {
  const segment = segments[si];
  if (!segment) { return false; }
  const isLast = si === segments.length - 1;

  if (segment.kind === "descendants") {
    if (isLast) {
      // 末尾の ** : node 自身とその全子孫が終端の候補 (0 個以上のセグメント)
      return existsInSubtree(node, (d) => (valueQuery ? matchValue(d, valueQuery) : true));
    }
    // 0 個消費して次のセグメントへ / 1 レベル潜って ** を継続
    if (matchChainDown(node, segments, si + 1, valueQuery)) { return true; }
    return (node.childs ?? []).some((child) => matchChainDown(child, segments, si, valueQuery));
  }

  return (node.childs ?? []).some((child) => {
    if (!matchSegmentAt(child, segment)) { return false; }
    if (isLast) {
      return valueQuery ? matchValue(child, valueQuery) : true;
    }
    return matchChainDown(child, segments, si + 1, valueQuery);
  });
};

/**
 * キーパスクエリを「item で終わるチェーン」として上方向に照合する.
 * path = [ルート, ..., 親, item] に対し segments が末尾 (item) で終わるように並ぶこと.
 * anchored ($) の場合はチェーンを消費し切ったときルートだけが残っていること
 * (= チェーンがルート直下から始まること).
 */
const matchKeyPathAt = (item: JsonRowItem, keyPathQuery: KeyPathQuery): boolean => {
  const path = [...item.rowItems, item];
  const { segments, anchored } = keyPathQuery;

  const match = (pi: number, si: number): boolean => {
    if (si < 0) {
      return anchored ? pi === 0 : true;
    }
    const segment = segments[si];
    if (segment.kind === "descendants") {
      // 0 個消費 / path[pi] を ** に食わせて遡る (ルート pi=0 は食わせない)
      return match(pi, si - 1) || (pi >= 1 && match(pi - 1, si));
    }
    if (pi < 0) { return false; }
    if (!matchSegmentAt(path[pi], segment)) { return false; }
    return match(pi - 1, si - 1);
  };

  return match(path.length - 1, segments.length - 1);
};

export function matchByQuery(item: JsonRowItem, query: GroupedQuery | Query): boolean {
  switch (query.type) {
    case "GroupedQuery": {
      switch (query.op) {
        case "and":
          return query.queries.every((q) => matchByQuery(item, q));
        case "or":
          return query.queries.some((q) => matchByQuery(item, q));
      }
      return false;
    }
    case "Query": {
      // キーパスと値は同じノード (チェーン末端 = item) で評価する
      if (query.keyPathQuery && !matchKeyPathAt(item, query.keyPathQuery)) {
        return false;
      }
      if (query.valueQuery && !matchValue(item, query.valueQuery)) {
        return false;
      }
      return true;
    }
  }
  return false;
}
