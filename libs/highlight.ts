import { JsonRowItem } from "./jetson";
import { ItemMatcher, buildMatcher } from "./query_matcher";
import type { QueryMode } from "@/states/manipulation/query";

/**
 * カラーリングルール: クエリにマッチした行へ色を常駐適用する注釈レイヤー.
 *
 * 検索 (絞り込み・lightup) が非マッチ行を降格するのに対し, ルールはマッチ行を
 * 昇格させるだけで, 非マッチ行の表示には一切影響しない。だから巡回ナビも減光も
 * 持たない — 所在の把握はミニマップの帯が担う。
 * ルールはドキュメント横断で使い回すためグローバル (localStorage) に持つ。
 */

/** パレット色数. テーマ側の highlight-{0..N-1}-row / -marker トークンと対応する */
export const HIGHLIGHT_PALETTE_SIZE = 8;

export type HighlightRule = {
  id: string;
  name: string; // 空なら一覧では query を表示名にする
  query: string;
  mode: QueryMode;
  /** パレット index (0..HIGHLIGHT_PALETTE_SIZE-1) */
  color: number;
  enabled: boolean;
  createdAt: number; // epoch ms
};

export type HighlightMaps = {
  /** 行 index → 色. 複数ルールがマッチした行はリスト順で最初のルールが勝つ */
  rowColor: { [index: number]: number };
  /**
   * ルール id → マッチ行数. 先勝ちとは無関係に全ルール独立に数える。
   * 0件も「該当なしの確認」として意味を持つ。
   * 有効でも matcher を構築できないルール (構文エラー・短すぎる simple クエリ) は
   * ここに現れない — パネル側はこれを「無効なクエリ」の表示に使う。
   */
  counts: { [ruleId: string]: number };
};

/**
 * 全行 × 有効ルールの評価. O(行数 × ルール数) だが, 再計算はドキュメントか
 * ルールが変わった時だけで, キー入力毎に全行を走る検索より条件は緩い。
 */
export const computeHighlightMaps = (items: JsonRowItem[], rules: HighlightRule[]): HighlightMaps => {
  const active: { rule: HighlightRule; matcher: ItemMatcher }[] = [];
  for (const rule of rules) {
    if (!rule.enabled) { continue; }
    const matcher = buildMatcher(rule.mode, rule.query);
    if (!matcher) { continue; }
    active.push({ rule, matcher });
  }

  const rowColor: HighlightMaps["rowColor"] = {};
  const counts: HighlightMaps["counts"] = {};
  for (const { rule } of active) { counts[rule.id] = 0; }

  for (const item of items) {
    for (const { rule, matcher } of active) {
      if (!matcher(item)) { continue; }
      counts[rule.id] += 1;
      if (!(item.index in rowColor)) { rowColor[item.index] = rule.color; }
    }
  }
  return { rowColor, counts };
};
