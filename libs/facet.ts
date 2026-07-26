/**
 * advanced クエリの合成. 入口は2つある:
 *
 * - プロファイルの統計表示から (composeFacetQuery / composeKeyPatternQuery):
 *   ドット結合済みのキーパスパターン (例: items.*.status) を受け取る。
 * - JSON 行のキーセルから (composeKeyPathQuery):
 *   セグメント列 (例: ["items", 3, "status"]) を受け取る。
 *
 * 値リテラルは JSON 表現の文字列。値分布 (uniqueValues のキー) なら `"error"` や `42`,
 * 真偽値・null の統計チップなら `true` / `false` / `null`。文字列は引用形 (厳密一致),
 * 数値・真偽値・null は裸で合成する。
 *
 * 合成できない場合は null を返す (クエリ言語にキー側の引用構文が無いため,
 * 構造文字を含むキー名などは表現できない)。UI はその項目をクリック不可にする。
 */

/**
 * キーパスセグメントとして書けない文字: クエリ言語の構造文字と空白
 */
const SEGMENT_FORBIDDEN = /[.:$()[\]&|\s]/;

/**
 * パターンとしてのセグメントが表現可能か.
 * "*" 単体は配列マージのワイルドカードとしてそのまま使える (意図した意味論)。
 * それ以外で * を含むセグメントは部分ワイルドカードに誤解釈されるので不可。
 */
const isExpressibleSegment = (segment: string): boolean => {
  if (segment === "*") { return true; }
  return isExpressibleLiteralSegment(segment);
};

/**
 * 実在するキー名としてのセグメントが表現可能か.
 * パターン版と違い "*" 単体も不可: リテラルなキー名 "*" を書く手段が無く,
 * そのまま出すとワイルドカードとして全キーにマッチしてしまう。
 */
const isExpressibleLiteralSegment = (segment: string): boolean => {
  if (segment.length === 0) { return false; }
  if (SEGMENT_FORBIDDEN.test(segment)) { return false; }
  if (segment.includes("*")) { return false; }
  return true;
};

/**
 * 値のリテラル (JSON 表現) をクエリの値トークンに変換する.
 */
export const composeValueToken = (literal: string): string | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(literal);
  } catch {
    return null;
  }
  if (typeof parsed === "number" || typeof parsed === "boolean" || parsed === null) {
    return String(parsed);
  }
  if (typeof parsed === "string") {
    // 制御文字入りの値はクエリ入力欄で編集できない形になるため合成しない
    if (/[\u0000-\u001f]/.test(parsed)) { return null; }
    return `"${parsed.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
  }
  // オブジェクト・配列のリテラルは対象外 (統計表示に現れない)
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
  const keyQuery = composeKeyPatternQuery(keypath);
  if (keyQuery === null) { return null; }
  const value = composeValueToken(literal);
  if (value === null) { return null; }
  return `${keyQuery}:${value}`;
};

/**
 * キーパスパターンだけから (値条件なしの) クエリを合成する.
 * 例: "items.*.status" → "$.items.*.status"
 *
 * プロファイルのキーパスは配列要素が "*" に畳まれているので, これがそのまま
 * 「同じ階層にいる同名キーすべて」にマッチするクエリになる。
 */
export const composeKeyPatternQuery = (keypath: string): string | null => {
  if (keypath.length === 0) { return null; }
  if (!keypath.split(".").every(isExpressibleSegment)) { return null; }
  return `$.${keypath}`;
};

/**
 * キーパスのセグメント (キー名または配列添字)
 */
export type KeyPathSegment = string | number;

export type KeyPathQueryOptions = {
  /**
   * 先頭に $ を付け, ルート直下から始まるチェーンとして固定する (既定 true).
   * false ならどの深さから始まってもよい非アンカーのチェーンになる。
   */
  anchored?: boolean;
  /**
   * 数値セグメント (配列添字) を * に緩和する.
   * 「同じ階層にいる同名キーすべて」を得るための操作。
   */
  relaxIndices?: boolean;
  /**
   * 末尾に付ける値条件 (composeValueToken の戻り値)
   */
  value?: string;
  /**
   * 末尾セグメントに付ける述語. `[$.<key>:<value>]` の形になり,
   * 「直下の <key> が <value> であるノード」を選ぶ条件になる。
   */
  predicate?: { key: KeyPathSegment; value: string };
};

/**
 * セグメント列からキーパスクエリを合成する.
 * 例: (["items", 3, "status"], { relaxIndices: true }) → "$.items.*.status"
 *
 * ドット結合済みのキーパスではなくセグメント列を受け取るので, キー名に "." を
 * 含むドキュメントでも段境界が曖昧にならず, 表現できないキーをその場で検出できる
 * (composeFacetQuery 側にはできない。elementKey の表現に由来する既知の限界)。
 */
export const composeKeyPathQuery = (
  segments: KeyPathSegment[],
  options: KeyPathQueryOptions = {},
): string | null => {
  const { anchored = true, relaxIndices = false, value, predicate } = options;
  if (segments.length === 0) { return null; }

  const written: string[] = [];
  for (const segment of segments) {
    if (relaxIndices && typeof segment === "number") {
      written.push("*");
      continue;
    }
    const literal = `${segment}`;
    if (!isExpressibleLiteralSegment(literal)) { return null; }
    written.push(literal);
  }

  let query = (anchored ? "$." : "") + written.join(".");

  if (predicate) {
    const key = `${predicate.key}`;
    if (!isExpressibleLiteralSegment(key)) { return null; }
    // 述語の中も $ で固定する: 付けないと部分木のどこにあってもマッチしてしまう
    query += `[$.${key}:${predicate.value}]`;
  }
  if (typeof value !== "undefined") {
    query += `:${value}`;
  }
  return query;
};
