import { QueryToken, QueryTokenType } from "./types";
import { QuerySyntaxError } from "./QuerySyntaxError";

/**
 * キーパス側の構造文字. これら (と空白) 以外の文字はすべてセグメント文字。
 * つまりキー名には * (ワイルドカード) や @ - + / なども使える.
 */
const structuralChars: { [c: string]: QueryTokenType } = {
  ":": "key-value-separator",
  ".": "keypath-separator",
  "$": "root",
  "(": "paren-open",
  ")": "paren-close",
  "[": "bracket-open",
  "]": "bracket-close",
  "&": "and",
  "|": "or",
};

/**
 * 裸の値の終端文字 (空白も終端). これらを含む値は引用形 "..." で書く.
 */
const valueTerminators = new Set(["&", "|", ")", "]"]);

/**
 * クエリ文字列をトークン列にする.
 *
 * キーパスモードと値モードの2モードを持つ:
 * - キーパスモード: 構造文字がそれぞれのトークンになり, その他の文字の連続が
 *   key セグメントになる. 空白はセグメントの区切り (連続するセグメントは parser がエラーにする).
 * - 値モード ( : の直後): 先頭が " なら引用形 (\" と \\ のエスケープ, 他の \x は x そのまま),
 *   そうでなければ空白か & | ) ] までの連続を値とする.
 *   したがって裸の値には . : $ ( [ * などを含められる (小数 1.5, 時刻 12:30 など).
 */
export const tokenizeQuery = (query: string) => {
  const tokens: QueryToken[] = [];
  let buffer = "";
  let i = 0;

  const flushSegment = () => {
    if (buffer.length === 0) { return; }
    tokens.push(
      buffer === "**"
        ? { type: "descendant-wildcard", token: buffer }
        : { type: "key", token: buffer }
    );
    buffer = "";
  };

  while (i < query.length) {
    const c = query[i];
    if (c.match(/\s/)) {
      flushSegment();
      i += 1;
      continue;
    }
    const structural = structuralChars[c];
    if (!structural) {
      buffer += c;
      i += 1;
      continue;
    }
    flushSegment();
    tokens.push({ type: structural, token: c });
    i += 1;
    if (structural === "key-value-separator") {
      i = scanValue(query, i, tokens);
    }
  }
  flushSegment();
  tokens.push({ type: "end", token: "" });
  return tokens;
};

/**
 * ":" の直後から値を1つ読み, 読み終えた次の位置を返す.
 * 値が無い場合はトークンを出さない (parser が「値が必要」エラーにする).
 */
const scanValue = (query: string, start: number, tokens: QueryToken[]): number => {
  let i = start;
  while (i < query.length && query[i].match(/\s/)) { i += 1; }
  if (i >= query.length) { return i; }

  if (query[i] === '"') {
    let value = "";
    i += 1;
    while (i < query.length) {
      const c = query[i];
      if (c === "\\") {
        if (i + 1 >= query.length) {
          throw new QuerySyntaxError("Unterminated Escape", "\\ の後に文字がありません", { position: i });
        }
        value += query[i + 1];
        i += 2;
        continue;
      }
      if (c === '"') {
        tokens.push({ type: "value", token: value, quoted: true });
        return i + 1;
      }
      value += c;
      i += 1;
    }
    throw new QuerySyntaxError("Unterminated String", "引用符 \" が閉じていません", { position: start });
  }

  let value = "";
  while (i < query.length && !query[i].match(/\s/) && !valueTerminators.has(query[i])) {
    value += query[i];
    i += 1;
  }
  if (value.length > 0) {
    tokens.push({ type: "value", token: value, quoted: false });
  }
  return i;
};
