import _ from "lodash";
import { JsonRowItem } from "./jetson";
import { parseQuery } from "./advanced_query/parseQuery";
import { matchByQuery } from "./advanced_query/matcher";
import type { QueryMode } from "@/states/manipulation/query";

/**
 * 検索とカラーリングルールで共用する行 matcher の構築.
 *
 * simple / advanced どちらも「行アイテム1つに対して真偽を返す純関数」を返す.
 * 構築できない入力 (短すぎる simple クエリ・構文エラー・空クエリ) では null を返し,
 * 呼び出し側は「マッチ判定なし」として扱う.
 */

export type ItemMatcher = (item: JsonRowItem) => boolean;

export const makeSimpleMatcher = (query: string): ItemMatcher | null => {
  const simpleQuery = query.trim().toLowerCase();
  // 最小2文字まで入力されるまで検索を開始しない（パフォーマンス改善）
  if (simpleQuery.length < 2) { return null; }
  return (item: JsonRowItem) => {
    const key = item.itemKey?.toString().toLowerCase();
    if (key?.includes(simpleQuery)) { return true; }
    if (item.right.type === "string") {
      const value = item.right.value.toLowerCase();
      if (value.includes(simpleQuery)) {
        return true;
      }
    } else if (item.right.type === "number") {
      const value = item.right.value.toString().toLowerCase();
      if (value.includes(simpleQuery)) {
        return true;
      }
    }
    return false;
  };
};

/**
 * parseQuery の結果から matcher を作る.
 * パース結果を構文エラー表示と共有する呼び出し側 (advancedMatcherAtom) のために
 * makeAdvancedMatcher と分けてある.
 */
export const matcherOfParsedQuery = (parsed: ReturnType<typeof parseQuery>): ItemMatcher | null => {
  if (parsed.syntaxError) { return null; }
  const q = parsed.structure ? _.first(parsed.structure) : undefined;
  if (!q) { return null; }
  if (q.type === "GroupedQuery" || q.type === "Query") {
    return (item: JsonRowItem) => matchByQuery(item, q);
  }
  return () => true;
};

export const makeAdvancedMatcher = (query: string): ItemMatcher | null =>
  matcherOfParsedQuery(parseQuery(query.trim()));

export const buildMatcher = (mode: QueryMode, query: string): ItemMatcher | null =>
  mode === "simple" ? makeSimpleMatcher(query) : makeAdvancedMatcher(query);
