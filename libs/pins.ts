import { JsonValueObject } from "./jetson";

/**
 * ドキュメントに付随するピン (しおり).
 *
 * 同定はキーパス (JsonRowItem.elementKey) で行う. 行 index はドキュメントの
 * 編集でずれるが, キーパスならオブジェクトキーの増減に対して安定する.
 */
export type DocumentPin = {
  /** ピンを打った行のキーパス. ルートは "" */
  keypath: string;
  memo: string;
  created_at: Date;
  /** ピンを打った時点の値の短い表示. 一覧表示と位置ズレの目視確認に使う */
  valuePreview: string;
};

export const PIN_VALUE_PREVIEW_MAX_LENGTH = 80;

/**
 * ピン一覧に出す値のプレビュー文字列を作る.
 * コンテナは中身を展開せず要素数だけ, リーフは JSON 表現を上限まで.
 */
export function pinValuePreview(vo: JsonValueObject): string {
  switch (vo.type) {
    case "map": {
      const size = Object.keys(vo.value).length;
      return `{…} ${size} keys`;
    }
    case "array":
      return `[…] ${vo.value.length} items`;
    default: {
      const literal = JSON.stringify(vo.value) ?? "";
      return literal.length > PIN_VALUE_PREVIEW_MAX_LENGTH
        ? literal.slice(0, PIN_VALUE_PREVIEW_MAX_LENGTH - 1) + "…"
        : literal;
    }
  }
}

/**
 * ナローイングスタックを, index を含む範囲が top になるまで pop した結果を返す.
 * どの範囲にも含まれなければ空になる. 変更が不要なら同じ参照を返す.
 */
export function popNarrowedRangesToInclude<R extends { from: number; to: number }>(
  stack: R[],
  index: number,
): R[] {
  let next = stack;
  while (next.length > 0) {
    const top = next[next.length - 1];
    if (top.from <= index && index < top.to) { break; }
    next = next.slice(0, -1);
  }
  return next;
}
