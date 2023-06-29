import { QueryToken, QueryTokenType } from "./types";

const queryTokenMap: { [K in QueryTokenType]: RegExp }  = {
  "key-value-separator": /[:]/,
  "keypath-separator": /[.]/,
  // "weak": /[?]/,
  "root": /[$]/,
  "match-target-specifier": /[@]/,
  "paren-open": /[(]/,
  "paren-close": /[)]/,
  "and": /[&]/,
  "or": /[|]/,
  "key": /[^:.$@()&|]/,
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

