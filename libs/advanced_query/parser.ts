import _ from "lodash";
import { AtQuery, CompoundQuery, DotQuery, GenericQuery, GroupedQuery, isKeyStringLikeQuery, KeyPathQuery, KeyPathQuerySubsidiary, KeyQuery, KeyStringQuery, Query, QueryToken, QueryTokenType, RootQuery, TokenToQuery, ValueQuery, ValueQuerySubsidiary } from "./types";
import { QuerySyntaxError } from "./QuerySyntaxError";

const startingTokens: TokenToQuery[] = [
  {
    token: "paren-open",
    levels: ["GroupedQuery"],
    mustCatch: true,
  },
  {
    token: "root",
    levels: ["KeyPathQuery", "Query"],
  },
  {
    token: "keypath-separator",
    levels: ["KeyPathQuery", "Query"],
  },
  {
    token: "match-target-specifier",
    levels: ["KeyPathQuery", "Query"],
  },
  {
    token: "key-value-separator",
    levels: ["ValueQuery", "Query"],
  },
  {
    token: "key",
    levels: ["KeyPathValueQuery", "Query"],
  },
];

const enderParenClose: TokenToQuery = {
  token: "paren-close",
  levels: ["KeyPathValueQuery", "Query", "GroupedQuery"],
  mustCatch: true,
};

const endingTokens: TokenToQuery[] = [
  {
    token: "end",
    levels: ["KeyPathValueQuery", "Query"],
  },
  enderParenClose,
  {
    token: "and",
    levels: ["KeyPathValueQuery", "Query"],
  },
  {
    token: "or",
    levels: ["KeyPathValueQuery", "Query"],
  },
  {
    token: "key-value-separator",
    levels: ["KeyPathQuery"],
  },
];

const continuingTokens = [
  { token: "and", query: "AndQuery" },
  { token: "or", query: "OrQuery" },
  { token: "root", query: "RootQuery" },
  { token: "keypath-separator", query: "DotQuery" },
  { token: "match-target-specifier", query: "AtQuery" },
  { token: "key", query: "KeyStringQuery" },
  { token: "single-key-wildcard", query: "KeyStringQuery" },
] as const;

function isQueryLike(q?: GenericQuery): q is Query | GroupedQuery {
  return q?.type === "GroupedQuery" || q?.type === "Query";
}

function isKeyPathQueryComponent(q: GenericQuery): q is RootQuery | DotQuery | AtQuery | KeyStringQuery {
  return ["RootQuery", "DotQuery", "AtQuery", "KeyStringQuery"].includes(q.type);
}

// クエリ列 rest を 開いたクエリ opener に合わせて還元する
function reduceQueries(ender: TokenToQuery, opener: CompoundQuery, rest: GenericQuery[]) {
  if (opener.type === "GroupedQuery") {


    // GroupedQuery
    // -> 長さが1以上である
    // -> GroupedQuery, Query, AndQuery, OrQuery のみを含む
    // -> 以下を繰り返す:
    //   -> AndQuery を探す
    //      -> 前後にあるのが GroupedQuery | Query なら, それらをAndでまとめた GroupedQuery を作成
    //   -> AndQuery がなければ OrQuery を探す
    //      -> 前後にあるのが GroupedQuery | Query なら, それらをOrでまとめた GroupedQuery を作成
    //   -> どちらもなければ終了
    // -> 長さが1より大きい場合はシンタックスエラー
    // -> 最後に残っているのが GroupedQuery | Query でなければシンタックスエラー
    const unexpected = rest.find(r => !["GroupedQuery", "Query", "AndQuery", "OrQuery"].includes(r.type));
    if (unexpected) {
      throw new QuerySyntaxError("Invalid Grouped Query", `operands include an unexpected type of query: ${unexpected.type}`, { ender, compound: opener, rest });
    }
    while (true) {
      const andIndex = rest.findIndex(r => r.type === "AndQuery");
      if (0 <= andIndex) {
        if (andIndex - 1 < 0) {
          throw new QuerySyntaxError("Invalid Binary Operator", "operator AND needs LHS", { ender, compound: opener, rest });
        }
        if (rest.length <= andIndex + 1) {
          throw new QuerySyntaxError("Invalid Binary Operator", "operator AND needs RHS", { ender, compound: opener, rest });
        }
        const lhs = rest[andIndex - 1];
        const rhs = rest[andIndex + 1];
        if (!isQueryLike(lhs) || !isQueryLike(rhs)) {
          throw new QuerySyntaxError("Invalid Binary Operator", "operator AND only accepts query-like as operand", { ender, compound: opener, rest });
        }
        if (rest.length === 3) {
          rest.splice(0, 3);
          opener.op = "and";
          opener.queries = [lhs, rhs];
          return;
        } else {
          const newGrouped: GroupedQuery = {
            type: "GroupedQuery",
            closed: true,
            op: "and",
            queries: [lhs, rhs],
          };
          rest.splice(andIndex - 1, 3, newGrouped);
          continue;
        }
      }
      const orIndex = rest.findIndex(r => r.type === "OrQuery");
      if (0 <= orIndex) {
        if (orIndex - 1 < 0) {
          throw new QuerySyntaxError("Invalid Binary Operator", "operator OR needs LHS", { ender, compound: opener, rest });
        }
        if (rest.length <= orIndex + 1) {
          throw new QuerySyntaxError("Invalid Binary Operator", "operator OR needs RHS", { ender, compound: opener, rest });
        }
        const lhs = rest[orIndex - 1];
        const rhs = rest[orIndex + 1];
        if (!isQueryLike(lhs) || !isQueryLike(rhs)) {
          throw new QuerySyntaxError("Invalid Binary Operator", "operator OR only accepts query-like as operand", { ender, compound: opener, rest });
        }
        if (rest.length === 3) {
          rest.splice(0, 3);
          opener.op = "or";
          opener.queries = [lhs, rhs];
          return;
        } else {
          const newGrouped: GroupedQuery = {
            type: "GroupedQuery",
            closed: true,
            op: "or",
            queries: [lhs, rhs],
          };
          rest.splice(orIndex - 1, 3, newGrouped);
          continue;
        }
      }
      break;  
    }
    if (rest.length !== 1) {
      throw new QuerySyntaxError("Invalid Grouped Query", "operands couldn't be reduced into only one element", { ender, compound: opener, rest });
    }
    const f = rest[0];
    if (!isQueryLike(f)) {
      throw new QuerySyntaxError("Invalid Grouped Query", "the reduced element is not a query-like", { ender, compound: opener, rest });
    }
    opener.queries = [f];


  } else if (opener.type === "Query") {


    // Query
    // -> [KeyPathQuery?, ValueQuery?]
    let f = rest.shift();
    if (f?.type === "KeyPathQuery") {
      opener.keyPathQuery = f;
      f = rest.shift();
    }
    if (f?.type === "ValueQuery") {
      opener.valueQuery = f;
      f = rest.shift();
    }
    if (f) {
      throw new QuerySyntaxError("Invalid Query", "has an unexpected query", { ender, compound: opener, rest });
    }


  } else if (opener.type === "KeyPathQuery") {


    // KeyPathQuery
    // -> セパレータとKeyが交互になっている
    // -> $(ルート)
    //    先頭以外の場所にあるとシンタックスエラー
    //    複数あるとシンタックスエラー
    let last_is_key = true;
    let count_root = 0;
    let count_at = 0;
    let stringQuery: KeyStringQuery | null = null;
    const subQueries: KeyPathQuerySubsidiary[] = [];
    for (let i = 0; i < rest.length; i += 1) {
      const q = rest[i];
      if (!isKeyPathQueryComponent(q)) {
        throw new QuerySyntaxError("Invalid KeyPathQuery", `operands include an unexpected type of query: ${q.type}`, { ender, compound: opener, rest });
      }
      if (0 < i && last_is_key === isKeyStringLikeQuery(q)) {
        throw new QuerySyntaxError("Invalid KeyPathQuery", "operands are not well separated", { ender, compound: opener, rest });
      }
      if (q.type === "RootQuery") {
        if (0 < i) {
          throw new QuerySyntaxError("Invalid Root Position", "root($) must be at head of keyPath", { ender, compound: opener, rest });
        }
        count_root += 1;
        if (count_root > 1) {
          throw new QuerySyntaxError("Invalid Root Usage", "root($) must be at most one", { ender, compound: opener, rest });
        }
      }
      if (q.type === "AtQuery") {
        count_at += 1;
        if (count_at > 1) {
          throw new QuerySyntaxError("Invalid Atmark Usage", "at(@) must be at most one", { ender, compound: opener, rest });
        }
      }
      last_is_key = isKeyStringLikeQuery(q);

      if (q.type === "KeyStringQuery") {
        stringQuery = q;
      } else {
        const ks: KeyQuery = {
          type: "KeyQuery",
          position: q.type === "RootQuery" ? "$" : q.type === "AtQuery" ? "@" : ".",
          string: stringQuery || undefined,
        };
        subQueries.push(ks);
        stringQuery = null;
      }
    }
    if (stringQuery) {
      const ks: KeyQuery = {
        type: "KeyQuery",
        position: count_at > 0 ? "." : "@",
        string: stringQuery,
      };
      subQueries.push(ks);
      stringQuery = null;
    }
    
    opener.tokens = subQueries;


  } else if (opener.type === "ValueQuery") {


    // ValueQuery
    // -> key 高々1つ
    if (rest.length <= 1 && rest.every(r => r.type === "KeyStringQuery")) {
      opener.tokens = rest as ValueQuerySubsidiary[];
      return;
    }
    throw new QuerySyntaxError("Invalid ValueQuery", "has an unexpected query", { ender, compound: opener, rest });


  }
}

function enderProc(ender: TokenToQuery, opens: CompoundQuery[], stack: GenericQuery[]) {
  // - 前から順番に、対応する開いたオブジェクトが見つかるまでpopしていく
  // - 開いたオブジェクトまでにpopした要素を使って開いたオブジェクトを作る
  // - 開いたオブジェクトをpushする
  if (!_.last(opens)) {
    if (!ender.mustCatch) {
      return;
    }
    throw new QuerySyntaxError("Invalid Closer", "nothing opened", { ender, opens, stack });
  }
  const k = ender.levels.findIndex(level => {
    const last = _.last(opens)!;
    if (level === "KeyPathValueQuery") {
      return last.type === "KeyPathQuery" || last.type === "ValueQuery";
    }
    return level === last.type;
  });
  if (k < 0) {
    throw new QuerySyntaxError("Invalid Closer", "no corresponding opener", { ender, opens, stack });
  }
  for (let i = k; i < ender.levels.length; i += 1) {
    const opened = opens.pop();
    if (!opened) {
      throw new QuerySyntaxError("Invalid Closer", "no enough opener", { ender, opens, stack });
    }
    const level = ender.levels[i];
    const matched = (() => {
      if (level === "KeyPathValueQuery") {
        return opened.type === "KeyPathQuery" || opened.type === "ValueQuery";
      }
      return level === opened.type;
    })();
    if (!matched) {
      throw new QuerySyntaxError("Invalid Closer", "type of opener is unexpected", { ender, opens, stack });
    }
    // found corresponding open
    const rest: GenericQuery[] = [];
    while (_.last(stack) !== opened) {
      const o = stack.pop()!;
      rest.unshift(o);
    }
    stack.pop();
    reduceQueries(ender, opened, rest);
    opened.closed = true;
    stack.push(opened);
  }
}

function starterProc(starter: TokenToQuery, opens: CompoundQuery[], stack: GenericQuery[]) {
  // - 前から順番に:
  let i: number = 0;
  if (!starter.mustCatch) {
    //   - `?`あり
    //       - 開いたオブジェクトを探す。
    //       - 見つかったら、戻りながら見つからなかったタイプの開いたオブジェクトを作成してpushしていく。
    const last = _.last(opens);
    const k = last ? starter.levels.findIndex(level => {
      if (level === "KeyPathValueQuery") {
        return last.type === "KeyPathQuery" || last.type === "ValueQuery";
      }
      return level === last.type;
    }) : -1;
    if (k < 0) {
      i = starter.levels.length - 1;
    } else {
      i = k - 1;
    }
  } else {
    //   - `?`なし
    //       - 開いたオブジェクトを作成してpush
    //       - 戻りながら開いたオブジェクトを作成してpushしていく。
    i = starter.levels.length - 1;
  }
  for (; 0 <= i; i -= 1) {
    switch (starter.levels[i]) {
      case "GroupedQuery": {
        const o: GroupedQuery = {
          type: "GroupedQuery",
          op: "and",
          queries: [],
        };
        opens.push(o);
        stack.push(o);
        break;
      }
      case "Query": {
        const o: Query = {
          type: "Query",
        };
        opens.push(o);
        stack.push(o);
        break;
      }
      case "KeyPathValueQuery":
      case "KeyPathQuery": {
        const o: KeyPathQuery = {
          type: "KeyPathQuery",
          tokens: [],
        };
        opens.push(o);
        stack.push(o);
        break;
      }
      case "ValueQuery": {
        const o: ValueQuery = {
          type: "ValueQuery",
          tokens: [],
        };
        opens.push(o);
        stack.push(o);
        break;
      }
    }
  }
}

export const structurizeQuery = (tokens: QueryToken[]) => {
  const opens: CompoundQuery[] = [];
  const stack: GenericQuery[] = [];

  while (tokens.length > 0) {
    const token = tokens.shift()!;
    const ender = endingTokens.find(t => t.token === token.type);
    if (ender) {
      enderProc(ender, opens, stack);
    }

    const starter = startingTokens.find(t => t.token === token.type);
    if (starter) {
      starterProc(starter, opens, stack);
    }

    const continuer = continuingTokens.find(t => t.token === token.type);
    if (continuer) {
      if (continuer.query === "KeyStringQuery") {
        stack.push({ type: continuer.query, token: token.token });
      } else {
        stack.push({ type: continuer.query });
      }
    }
  }

  // opens が空でない -> シンタックスエラー
  if (opens.length > 0) {
    throw new QuerySyntaxError("Reduction Error", "remaining openers", { opens, stack });
  }
  // stack が [GroupedQuery] でない -> 左端に開いたGroupedQueryを追加してみる
  if (stack.length > 0) {
    if (stack.length > 1 || stack[0].type !== "GroupedQuery") {
      const openGroup: GroupedQuery = {
        type: "GroupedQuery",
        op: "and",
        queries: [],
      };
      opens.push(openGroup);
      stack.unshift(openGroup);
      const ender = enderParenClose;
      enderProc(ender, opens, stack);
    }
  }
  
  return stack;
};
