/**
 * ファセット絞り込み: プロファイルの値分布から advanced クエリを合成する.
 *
 * 値分布のリテラルは JSON 表現の文字列 (profile.ts の uniqueValues のキー) で,
 * 文字列なら `"error"`, 数値なら `42` の形。これを
 *   $.<キーパスパターン>:<値>
 * の形の advanced クエリに変換する。値は文字列なら引用形 (厳密一致),
 * 数値なら裸で合成する。
 *
 * 合成できない場合は null を返す (クエリ言語にキー側の引用構文が無いため,
 * 構造文字を含むキー名などは表現できない)。UI はその行をクリック不可にする。
 */

/**
 * キーパスセグメントとして書けない文字: クエリ言語の構造文字と空白
 */
const SEGMENT_FORBIDDEN = /[.:$()[\]&|\s]/;

/**
 * セグメントが表現可能か.
 * "*" 単体は配列マージのワイルドカードとしてそのまま使える (意図した意味論)。
 * それ以外で * を含むセグメントは部分ワイルドカードに誤解釈されるので不可。
 */
const isExpressibleSegment = (segment: string): boolean => {
  if (segment === "*") { return true; }
  if (segment.length === 0) { return false; }
  if (SEGMENT_FORBIDDEN.test(segment)) { return false; }
  if (segment.includes("*")) { return false; }
  return true;
};

/**
 * 値分布のリテラル (JSON 表現) をクエリの値トークンに変換する.
 */
const composeValueToken = (literal: string): string | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(literal);
  } catch {
    return null;
  }
  if (typeof parsed === "number") {
    return String(parsed);
  }
  if (typeof parsed === "string") {
    // 制御文字入りの値はクエリ入力欄で編集できない形になるため合成しない
    if (/[\u0000-\u001f]/.test(parsed)) { return null; }
    return `"${parsed.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
  }
  // uniqueValues は string / number のみのはずだが防御
  return null;
};

/**
 * キーパスパターン (例: items.*.status) と値リテラルから等値クエリを合成する.
 * 例: ("items.*.status", '"error"') → '$.items.*.status:"error"'
 *
 * keypath はドット結合なので, キー名自体に . を含むドキュメントでは
 * セグメント境界を復元できない (合成はできるがマッチしない)。これは
 * elementKey の表現に由来する既知の限界。
 */
export const composeFacetQuery = (keypath: string, literal: string): string | null => {
  if (keypath.length === 0) { return null; }
  if (!keypath.split(".").every(isExpressibleSegment)) { return null; }
  const value = composeValueToken(literal);
  if (value === null) { return null; }
  return `$.${keypath}:${value}`;
};
