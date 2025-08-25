import { QueryToken, QueryTokenType } from "./types";

const queryTokenMap: { [K in QueryTokenType]: RegExp }  = {
  // この文字より前はキーパスに対するクエリ(キーパスクエリ)、この文字より後ろは値に対するクエリ
  "key-value-separator": /[:]/, 

  // キーパスクエリの区切り文字
  "keypath-separator": /[.]/, 

  // "weak": /[?]/,

  // ルート, すなわちJSONのトップレベルを示す
  "root": /[$]/, 

  /*
   * 一度だけ.の代わりにキーパスクエリの区切り文字として使える. 
   * 使った場合, この文字以降のキーパスクエリに対するマッチは, @の直前のノードを表示させる.
   */
  "match-target-specifier": /[@]/,
  "paren-open": /[(]/,
  "paren-close": /[)]/,
  "and": /[&]/,
  "or": /[|]/,
  "single-key-wildcard": /[*]/,

  "key": /[^*:.$@()&|]/,
  // "value": /./,
  "end": /$/,
};

export const tokenizeQuery = (query: string) => {
  const tokens: QueryToken[] = [];
  let buffer = "";
  let inKey = false;
  let inValue = false;

  const subtypes = [
    "key-value-separator",
    "keypath-separator",
    // "weak",
    "root",
    "match-target-specifier",
    "paren-open",
    "paren-close",
    "and",
    "or",
    "single-key-wildcard",
    "end",
  ] as const;

  for (let i = 0; i < query.length; ++i) {
    const c = query[i];
    if (c.match(/\s/)) {
      // スペース類はスルー
      continue;
    }
    if (inValue) {
      buffer += c;
      continue;
    }

    if (c.match(queryTokenMap["key"])) {
      buffer += c;
      inKey = true;
      continue;
    }

    if (inKey) {
      tokens.push({ type: "key", token: buffer });
      buffer = "";
      inKey = false;
    }

    let matched = false;
    for (const subtype of subtypes) {
      if (c.match(queryTokenMap[subtype])) {
        tokens.push({ type: subtype, token: c });
        matched = true;
        break;
      }
    }
    if (!matched) {
      throw new Error("no matched type");
    }
  }
  if (inKey) {
    tokens.push({ type: "key", token: buffer });
    buffer = "";
    inKey = false;
  }
  tokens.push({ type: "end", token: "" });
  return tokens;
};

