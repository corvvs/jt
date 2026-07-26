/**
 * キーメニューのクエリ生成: JSON 行のキーセルから advanced クエリの候補列を作る.
 *
 * 候補は「完全指定 → 添字を緩和 → 深さ不問」という緩和の段と, 葉ノードでのみ
 * 意味を持つ「値付き」「親要素の述語」からなる。ユーザーは緩和済みの形を直接
 * 選べるので, 完全指定を手で書き換える手間が要らない。
 *
 * 合成できない候補 (キー名に "." や空白を含むなど) は列から落ちる。落ちるのは
 * 候補単位なので, 経路上に表現できないキーがあっても末尾キーだけを見る「深さ不問」は
 * 生き残る。ひとつも残らなければキーメニューはクエリ生成の節を出さない。
 */

import { JsonRowItem, isLeafType } from "./jetson";
import { KeyPathSegment, composeKeyPathQuery, composeValueToken } from "./facet";
import { parseQuery } from "./advanced_query/parseQuery";
import { matchByQuery } from "./advanced_query/matcher";

export type KeyQueryCandidate = {
  id: string;
  /**
   * メニューに出す説明. 対象のキー名はメニューの見出しに出るので, ここには入れない
   */
  label: string;
  query: string;
};

/**
 * ノードのキーパスをセグメント列にする. ルート (キーを持たない) は空配列.
 */
export const segmentsOf = (item: JsonRowItem): KeyPathSegment[] => {
  // rowItems は [ルート, ..., 親]. ルートはキーを持たないので落とす
  return [...item.rowItems, item].slice(1).map((node) => node.itemKey!);
};

/**
 * 対象ノードにマッチするクエリの候補列 (緩和が緩い順ではなく, 狭い順に並べる).
 */
export const buildKeyQueryCandidates = (item: JsonRowItem): KeyQueryCandidate[] => {
  const segments = segmentsOf(item);
  if (segments.length === 0) { return []; }
  const last = segments[segments.length - 1];
  const isIndex = typeof last === "number";
  const hasIndex = segments.some((segment) => typeof segment === "number");
  const valueToken = isLeafType(item.right.type)
    ? composeValueToken(JSON.stringify(item.right.value))
    : null;

  const candidates: KeyQueryCandidate[] = [];
  const push = (id: string, label: string, query: string | null) => {
    if (query === null) { return; }
    // 同じクエリになる候補は落とす (添字が無いパスでは緩和前後が一致する等)
    if (candidates.some((candidate) => candidate.query === query)) { return; }
    candidates.push({ id, label, query });
  };

  push("exact", "この項目だけ", composeKeyPathQuery(segments));

  push(
    "relaxed",
    isIndex ? "同じ配列の要素すべて" : "同じ階層の同名キー",
    hasIndex ? composeKeyPathQuery(segments, { relaxIndices: true }) : null,
  );

  // 裸の添字を非アンカーで出すと「どの配列の N 番目でも」になり意図から遠いので, キー名のときだけ
  if (!isIndex) {
    push("anywhere", "どの階層でも同名キー", composeKeyPathQuery([last], { anchored: false }));
  }

  if (valueToken !== null) {
    push(
      "same-value",
      "同じ値を持つ項目",
      composeKeyPathQuery(segments, { relaxIndices: true, value: valueToken }),
    );
    if (!isIndex && segments.length >= 2) {
      push(
        "owner",
        "この値を持つ親要素",
        composeKeyPathQuery(segments.slice(0, -1), {
          relaxIndices: true,
          predicate: { key: last, value: valueToken },
        }),
      );
    }
  }

  return candidates;
};

/**
 * クエリにマッチする行数を数える. 構文エラーや空クエリなら null.
 *
 * 候補ごとに全行を走るが, 1行あたりの照合はキーパスの深さに比例する程度なので
 * 数万行 × 候補数個であれば数十ミリ秒で済む。メニューを開いた時に1回だけ呼ぶこと。
 */
export const countQueryMatches = (items: JsonRowItem[], query: string): number | null => {
  const parsed = parseQuery(query);
  if (parsed.syntaxError) { return null; }
  const structure = parsed.structure?.[0];
  if (!structure) { return null; }
  let count = 0;
  for (const item of items) {
    if (matchByQuery(item, structure)) { count += 1; }
  }
  return count;
};
