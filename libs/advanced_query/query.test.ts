import { describe, expect, it } from "vitest";
import { flattenJson } from "../jetson";
import { tokenizeQuery } from "./tokenizer";
import { structurizeQuery } from "./parser";
import { matchByQuery } from "./matcher";
import { GroupedQuery, Query, QueryToken } from "./types";
import { QuerySyntaxError } from "./QuerySyntaxError";
import { parseQuery } from "./parseQuery";

const parse = (query: string) => structurizeQuery(tokenizeQuery(query));

const parseOne = (query: string): GroupedQuery | Query => {
  const structure = parse(query);
  expect(structure.length).toBe(1);
  return structure[0];
};

/**
 * query にマッチした行の elementKey 一覧 (文書順)
 */
const matchedKeys = (json: any, query: string): string[] => {
  const q = parseOne(query);
  const { items } = flattenJson(json, JSON.stringify(json));
  return items.filter((item) => matchByQuery(item, q)).map((item) => item.elementKey);
};

const tokenTypes = (query: string) => tokenizeQuery(query).map((t) => t.type);

const LOG_JSON = {
  items: [
    { status: "error", payload: { user: { id: 1 }, note: "x" }, price: 1.5 },
    { status: "ok", message: "error" },
  ],
  meta: { status: "error", count: 42, ratio: null, flag: true, tag: "42", empty: "" },
};

const USERS_JSON = {
  users: [
    { status: "active", posts: [{ title: "a" }, { title: "b" }] },
    { status: "banned", posts: [{ title: "c" }] },
  ],
};

describe("tokenizer: キーパス側", () => {
  it("セグメントと構造文字を分解する", () => {
    const tokens = tokenizeQuery("items.*.status:error");
    expect(tokens).toEqual([
      { type: "key", token: "items" },
      { type: "keypath-separator", token: "." },
      { type: "key", token: "*" },
      { type: "keypath-separator", token: "." },
      { type: "key", token: "status" },
      { type: "key-value-separator", token: ":" },
      { type: "value", token: "error", quoted: false },
      { type: "end", token: "" },
    ] satisfies QueryToken[]);
  });

  it("部分ワイルドカードは1つの key セグメントになる", () => {
    expect(tokenizeQuery("sta*us")[0]).toEqual({ type: "key", token: "sta*us" });
  });

  it("** は descendant-wildcard になる", () => {
    expect(tokenizeQuery("a.**.b").map((t) => t.type)).toEqual([
      "key", "keypath-separator", "descendant-wildcard", "keypath-separator", "key", "end",
    ]);
  });

  it("空白はセグメントの区切りになる", () => {
    expect(tokenizeQuery("a b").map((t) => [t.type, t.token])).toEqual([
      ["key", "a"], ["key", "b"], ["end", ""],
    ]);
  });

  it("述語の括弧をトークン化する", () => {
    expect(tokenTypes('a[b:1]')).toEqual([
      "key", "bracket-open", "key", "key-value-separator", "value", "bracket-close", "end",
    ]);
  });

  it("@ はただのキー文字になる", () => {
    expect(tokenizeQuery("user@example")[0]).toEqual({ type: "key", token: "user@example" });
  });
});

describe("tokenizer: 値側", () => {
  it("裸の値は . や : を含められる", () => {
    expect(tokenizeQuery("a:1.5")[2]).toEqual({ type: "value", token: "1.5", quoted: false });
    expect(tokenizeQuery("t:12:30")[2]).toEqual({ type: "value", token: "12:30", quoted: false });
  });

  it("裸の値は空白と & | ) ] で終わる", () => {
    expect(tokenTypes("a:1&b:2")).toEqual([
      "key", "key-value-separator", "value", "and", "key", "key-value-separator", "value", "end",
    ]);
    expect(tokenizeQuery("a[b:er]")[4]).toEqual({ type: "value", token: "er", quoted: false });
  });

  it("引用形は空白や記号を含められる", () => {
    expect(tokenizeQuery('a:"foo & bar"')[2]).toEqual({ type: "value", token: "foo & bar", quoted: true });
  });

  it('引用形のエスケープ: \\" と \\\\', () => {
    expect(tokenizeQuery('a:"say \\"hi\\" \\\\ ok"')[2]).toEqual({
      type: "value", token: 'say "hi" \\ ok', quoted: true,
    });
  });

  it("空の引用形は空文字列の値", () => {
    expect(tokenizeQuery('a:""')[2]).toEqual({ type: "value", token: "", quoted: true });
  });

  it("閉じていない引用形はエラー", () => {
    expect(() => tokenizeQuery('a:"oops')).toThrow(QuerySyntaxError);
  });

  it("値が無い場合は value トークンを出さない", () => {
    expect(tokenTypes("a:")).toEqual(["key", "key-value-separator", "end"]);
  });
});

describe("parser: 基本形", () => {
  it("keypath:value の形", () => {
    const q = parseOne("a.b:1");
    expect(q).toEqual({
      type: "Query",
      keyPathQuery: {
        type: "KeyPathQuery",
        anchored: false,
        segments: [
          { type: "SegmentQuery", kind: "pattern", pattern: "a" },
          { type: "SegmentQuery", kind: "pattern", pattern: "b" },
        ],
      },
      valueQuery: { type: "ValueQuery", token: "1", quoted: false },
    });
  });

  it("$ で anchored になる / 先頭の . は任意", () => {
    const anchored = parseOne("$.a") as Query;
    expect(anchored.keyPathQuery?.anchored).toBe(true);
    const plain = parseOne(".a") as Query;
    expect(plain.keyPathQuery?.anchored).toBe(false);
    expect(plain.keyPathQuery?.segments[0].pattern).toBe("a");
  });

  it("値のみのクエリ", () => {
    const q = parseOne(":err") as Query;
    expect(q.keyPathQuery).toBeUndefined();
    expect(q.valueQuery).toEqual({ type: "ValueQuery", token: "err", quoted: false });
  });

  it("空クエリは空配列", () => {
    expect(parse("")).toEqual([]);
    expect(parse("  ")).toEqual([]);
  });

  it("& は | より強く結合する", () => {
    const q = parseOne("a & b | c & d") as GroupedQuery;
    expect(q.op).toBe("or");
    expect(q.queries.map((x) => x.type)).toEqual(["GroupedQuery", "GroupedQuery"]);
    expect((q.queries[0] as GroupedQuery).op).toBe("and");
  });

  it("括弧でグループ化できる", () => {
    const q = parseOne("(a | b) & c") as GroupedQuery;
    expect(q.op).toBe("and");
    expect((q.queries[0] as GroupedQuery).op).toBe("or");
  });
});

describe("parser: 述語", () => {
  it("セグメントに述語が付く", () => {
    const q = parseOne('items.*[status:"error"]') as Query;
    const seg = q.keyPathQuery!.segments[1];
    expect(seg.pattern).toBe("*");
    expect(seg.predicates?.length).toBe(1);
    const inner = seg.predicates![0].query;
    expect(inner.keyPathQuery?.segments.map((s) => s.pattern)).toEqual(["status"]);
    expect(inner.valueQuery).toEqual({ type: "ValueQuery", token: "error", quoted: true });
  });

  it("複数の述語とネスト", () => {
    const multi = parseOne("a[b:1][c:2]") as Query;
    expect(multi.keyPathQuery!.segments[0].predicates?.length).toBe(2);

    const nested = parseOne("a[b[c:1]]") as Query;
    const outer = nested.keyPathQuery!.segments[0].predicates![0].query;
    expect(outer.keyPathQuery!.segments[0].predicates![0].query.valueQuery?.token).toBe("1");
  });

  it("値のみの述語 [:v]", () => {
    const q = parseOne("a[:500]") as Query;
    const inner = q.keyPathQuery!.segments[0].predicates![0].query;
    expect(inner.keyPathQuery).toBeUndefined();
    expect(inner.valueQuery?.token).toBe("500");
  });

  it("述語の後にチェーンを続けられる", () => {
    const q = parseOne('users.*[status:"active"].posts.*') as Query;
    expect(q.keyPathQuery!.segments.length).toBe(4);
    expect(q.keyPathQuery!.segments[1].predicates?.length).toBe(1);
  });
});

describe("parser: エラー", () => {
  const errorCases: [string, string][] = [
    ["a..b", "空のセグメント"],
    ["a:", "値なし"],
    ["a[b:1", "閉じていない述語"],
    ["[a]", "先頭の述語"],
    ["$", "$ のみ"],
    ["**[a]", "** への述語"],
    ["a:1 2", "値の後の余分なトークン"],
    ["a b", "区切りのないセグメント"],
    ["(a:1", "閉じていない括弧"],
    ["a &", "右辺のない AND"],
  ];
  for (const [query, label] of errorCases) {
    it(`${label}: ${JSON.stringify(query)}`, () => {
      expect(() => parse(query)).toThrow(QuerySyntaxError);
    });
  }
});

describe("matcher: キーパス照合", () => {
  it("後方一致: 任意の深さの status", () => {
    expect(matchedKeys(LOG_JSON, "status")).toEqual([
      "items.0.status", "items.1.status", "meta.status",
    ]);
  });

  it("チェーン: items.*.status", () => {
    expect(matchedKeys(LOG_JSON, "items.*.status")).toEqual([
      "items.0.status", "items.1.status",
    ]);
  });

  it("$ はルート直下からの完全一致 (単一セグメントでも効く)", () => {
    expect(matchedKeys(LOG_JSON, "$.meta.status")).toEqual(["meta.status"]);
    expect(matchedKeys(LOG_JSON, "$.meta")).toEqual(["meta"]);
    expect(matchedKeys(LOG_JSON, "$.status")).toEqual([]);
  });

  it("部分ワイルドカード", () => {
    expect(matchedKeys(LOG_JSON, "meta.sta*us")).toEqual(["meta.status"]);
  });

  it("** は 0 個以上のセグメント", () => {
    expect(matchedKeys(LOG_JSON, "$.items.**.id")).toEqual(["items.0.payload.user.id"]);
    // 0 個: items.**.status は items.*.status と同じものを含む
    expect(matchedKeys(LOG_JSON, "items.**.status")).toEqual([
      "items.0.status", "items.1.status",
    ]);
  });
});

describe("matcher: 値照合", () => {
  it("キーパスと値は同じノードで評価される", () => {
    expect(matchedKeys(LOG_JSON, 'items.*.status:"error"')).toEqual(["items.0.status"]);
  });

  it("小数と数値の裸比較", () => {
    expect(matchedKeys(LOG_JSON, "price:1.5")).toEqual(["items.0.price"]);
    expect(matchedKeys(LOG_JSON, "count:42")).toEqual(["meta.count"]);
  });

  it("引用形は文字列値のみに厳密一致する", () => {
    expect(matchedKeys(LOG_JSON, 'count:"42"')).toEqual([]);
    expect(matchedKeys(LOG_JSON, 'tag:"42"')).toEqual(["meta.tag"]);
  });

  it("裸の値は型を見ない toString 比較", () => {
    expect(matchedKeys(LOG_JSON, "tag:42")).toEqual(["meta.tag"]);
    expect(matchedKeys(LOG_JSON, "flag:true")).toEqual(["meta.flag"]);
  });

  it("null は裸の null にマッチし, 引用形にはマッチしない", () => {
    expect(matchedKeys(LOG_JSON, "ratio:null")).toEqual(["meta.ratio"]);
    expect(matchedKeys(LOG_JSON, 'ratio:"null"')).toEqual([]);
  });

  it("空文字列は引用形で書ける", () => {
    expect(matchedKeys(LOG_JSON, 'empty:""')).toEqual(["meta.empty"]);
  });
});

describe("matcher: 述語 (要件3: 部分木の条件で祖先にマッチ)", () => {
  it("値はチェーン末端に結びつく (message:error に釣られない)", () => {
    expect(matchedKeys(LOG_JSON, 'items.*[status:"error"]')).toEqual(["items.0"]);
  });

  it("述語は任意の深さにマッチする", () => {
    expect(matchedKeys(LOG_JSON, 'items.*[id:1]')).toEqual(["items.0"]);
  });

  it("$ 付き述語は直下に限定される", () => {
    expect(matchedKeys(LOG_JSON, "items.*[$.note:x]")).toEqual([]);
    expect(matchedKeys(LOG_JSON, "items.*[$.payload.note:x]")).toEqual(["items.0"]);
  });

  it("値のみの述語 [:v] は部分木のどこかの値", () => {
    expect(matchedKeys(LOG_JSON, 'items.*[:"error"]')).toEqual(["items.0", "items.1"]);
  });

  it("複数の述語は AND", () => {
    expect(matchedKeys(LOG_JSON, 'items.*[status:"error"][id:1]')).toEqual(["items.0"]);
    expect(matchedKeys(LOG_JSON, 'items.*[status:"error"][id:2]')).toEqual([]);
  });
});

describe("matcher: 述語 (要件4: 条件を満たすノードの配下にマッチ)", () => {
  it("特定レベル: active なユーザーの posts 要素", () => {
    expect(matchedKeys(USERS_JSON, 'users.*[status:"active"].posts.*')).toEqual([
      "users.0.posts.0", "users.0.posts.1",
    ]);
  });

  it("レベル指定なし: active なユーザーの配下すべて (自身を含む)", () => {
    expect(matchedKeys(USERS_JSON, 'users.*[status:"active"].**')).toEqual([
      "users.0",
      "users.0.status",
      "users.0.posts",
      "users.0.posts.0",
      "users.0.posts.0.title",
      "users.0.posts.1",
      "users.0.posts.1.title",
    ]);
  });
});

describe("matcher: 論理演算", () => {
  it("| は同一ノードに対する OR", () => {
    expect(matchedKeys(LOG_JSON, "count:42 | ratio:null")).toEqual([
      "meta.count", "meta.ratio",
    ]);
  });

  it("& は同一ノードに対する AND", () => {
    expect(matchedKeys(LOG_JSON, 'meta.* & status:"error"')).toEqual(["meta.status"]);
  });

  it("括弧を含む複合", () => {
    expect(matchedKeys(LOG_JSON, '(count:42 | ratio:null) & meta.*')).toEqual([
      "meta.count", "meta.ratio",
    ]);
  });
});

describe("parseQuery: 構文エラーを例外にせず取り込む", () => {
  // 回帰: tokenize 段階の QuerySyntaxError (未終了の引用符など) が例外として
  // 漏れると filterMapsAtom 経由でレンダー中に throw され, アプリごと落ちる.
  // tokenize エラー・structurize エラーのどちらも throw せず syntaxError で返すこと.
  // 前半3つは tokenize 段階 (未終了の引用符), 後半3つは structurize 段階のエラー.
  // ちなみに '"' 単独は値モードでないため key 文字扱いになりエラーにならない.
  const errorQueries = ['a:"', ':"', 'a:"oops', "a..b", "a:", "(a:1"];
  for (const query of errorQueries) {
    it(`throw せず syntaxError を返す: ${JSON.stringify(query)}`, () => {
      expect(() => parseQuery(query)).not.toThrow();
      const result = parseQuery(query) as { syntaxError?: QuerySyntaxError; structure?: unknown };
      expect(result.syntaxError).toBeInstanceOf(QuerySyntaxError);
      expect(result.structure).toBeUndefined();
    });
  }

  it("正常なクエリは structure を返し syntaxError は持たない", () => {
    const result = parseQuery("a:1") as { syntaxError?: QuerySyntaxError; structure?: unknown };
    expect(result.structure).toBeDefined();
    expect(result.syntaxError).toBeUndefined();
  });
});
