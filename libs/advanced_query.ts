import { advancedFilteringQueryAtom } from "@/states/manipulation";
import { atom, useAtom } from "jotai";
import _ from "lodash";

export class QuerySyntaxError implements Error {
  public name = "QuerySyntaxError"; 

  constructor(
    public subname: string,
    public message: string,
    public payload: {
      compound?: CompoundQuery;
      rest?: GenericQuery[];
      starter?: TokenToQuery;
      ender?: TokenToQuery;
      opens?: CompoundQuery[],
      stack?: GenericQuery[]
    } = {}
  ) {
  }

  public toString() {
    return [this.name, this.subname, this.message].join(": ");
  }
}

export const parsedAdvancedQueryAtom = atom(
  (get) => {
    const query = get(advancedFilteringQueryAtom);
    return parseQuery(query);
  }
);

type QueryTokenType =
  | "key-value-separator"
  | "keypath-separator"
  // | "weak"
  | "root"
  | "match-target-specifier"
  | "paren-open"
  | "paren-close"
  | "and"
  | "or"
  | "key"
  | "end"
  // | "value";

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

type QueryToken = {
  type: QueryTokenType;
  token: string;
};

const tokenizeQuery = (query: string) => {
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

export type ValueQuery = {
  type: "ValueQuery";
  tokens: ValueQuerySubsidiary[];
  closed?: boolean;
};

export type KeyPathQuery = {
  type: "KeyPathQuery";
  tokens: KeyPathQuerySubsidiary[];
  closed?: boolean;
};

export type Query = {
  type: "Query";
  keyPathQuery?: KeyPathQuery;
  valueQuery?: ValueQuery;
  closed?: boolean;
};

export type GroupedQuery = {
  type: "GroupedQuery";
  op: "and" | "or";
  queries: GroupedQuerySubsidiary[];
  closed?: boolean;
};

type QueryType = "ValueQuery" | "KeyPathQuery" | "Query" | "GroupedQuery";
type QueryGroup = QueryType | "KeyPathValueQuery";

type TokenToQuery = {
  token: QueryTokenType;
  levels: QueryGroup[];
  mustCatch?: boolean;
};

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
  { token: "key", query: "KeyQuery" },
] as const;

export type AndQuery = {
  type: "AndQuery",
};

export type OrQuery = {
  type: "OrQuery",
};

export type RootQuery = {
  type: "RootQuery",
};

export type DotQuery = {
  type: "DotQuery",
};

export type AtQuery = {
  type: "AtQuery",
};

export type KeyQuery = {
  type: "KeyQuery",
  token: string;
};

export type CompoundQuery = GroupedQuery | Query | KeyPathQuery | ValueQuery;
export type GenericQuery = CompoundQuery | AndQuery | OrQuery | RootQuery | DotQuery | AtQuery | KeyQuery;
type ValueQuerySubsidiary = KeyQuery;
type KeyPathQuerySubsidiary = RootQuery | DotQuery | AtQuery | KeyQuery;
type GroupedQuerySubsidiary = GroupedQuery | Query | AndQuery | OrQuery;

function isQueryLike(q?: GenericQuery): q is Query | GroupedQuery {
  return q?.type === "GroupedQuery" || q?.type === "Query";
}

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
    let last_is_key = true;
    for (let i = 0; i < rest.length; i += 1) {
      const q = rest[i];
      if (!(["RootQuery", "DotQuery", "AtQuery", "KeyQuery"]).includes(q.type)) {
        throw new QuerySyntaxError("Invalid KeyPathQuery", `operands include an unexpected type of query: ${q.type}`, { ender, compound: opener, rest });
      }
      if (0 < i && last_is_key === (q.type === "KeyQuery")) {
        throw new QuerySyntaxError("Invalid KeyPathQuery", "operands are not well separated", { ender, compound: opener, rest });
      }
      last_is_key = q.type === "KeyQuery";
    }
    opener.tokens = rest as KeyPathQuerySubsidiary[];
  } else if (opener.type === "ValueQuery") {
    // ValueQuery
    // -> key 高々1つ
    if (rest.length <= 1 && rest.every(r => r.type === "KeyQuery")) {
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
  console.log(k, "opens", opens.map(t => t.type), "stack", stack.map(t => t.type));
  if (k < 0) {
    throw new QuerySyntaxError("Invalid Closer", "no corresponding opener", { ender, opens, stack });
  }
  for (let i = k; i < ender.levels.length; i += 1) {
    const opened = opens.pop();
    if (!opened) {
      throw new QuerySyntaxError("Invalid Closer", "no enough opener", { ender, opens, stack });
    }
    // console.log(token, i, opened);
    // console.log("opens", opens.map(t => t.type));
    // console.log("stack", stack.map(t => t.type));
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
  console.log("starter", starter);
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

const structurizeQuery = (tokens: QueryToken[]) => {
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
      if (continuer.query === "KeyQuery") {
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
      console.log("ONE MORE");
      console.log("stack", stack.length, stack.map(s => s.type));
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

export const parseQuery = (query: string) => {
  // トークナイズ
  const tokens = tokenizeQuery(query);
  const originalTokens = [...tokens];
  // 検索構造体の構成
  try {
    const structure = structurizeQuery(tokens);
    return {
      tokens: originalTokens,
      structure,
    };
  } catch (error) {
    if (error instanceof QuerySyntaxError) {
      return {
        tokens: originalTokens,
        syntaxError: error,
      };
    }
    throw error;
  }
};

export const useAdvancedQuery = () => {
  const [advancedFilteringQuery, setAdvancedFilteringQuery] = useAtom(advancedFilteringQueryAtom);
  const [parsedQuery] = useAtom(parsedAdvancedQueryAtom);
  return {
    advancedFilteringQuery,
    setAdvancedFilteringQuery,
    parsedQuery,
  };
};
