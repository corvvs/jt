import { describe, expect, it } from "vitest";
import { buildKeyQueryCandidates, countQueryMatches } from "./key_query";
import { JsonRowItem, flattenJson, segmentsOf } from "./jetson";
import { tokenizeQuery } from "./advanced_query/tokenizer";
import { structurizeQuery } from "./advanced_query/parser";
import { matchByQuery } from "./advanced_query/matcher";

const itemsOf = (json: any): JsonRowItem[] => flattenJson(json, JSON.stringify(json)).items;

/**
 * elementKey で行を引く. テストでは衝突しないキーだけを使う
 */
const findItem = (items: JsonRowItem[], elementKey: string): JsonRowItem => {
  const item = items.find((i) => i.elementKey === elementKey);
  expect(item, `item not found: ${elementKey}`).toBeDefined();
  return item!;
};

/**
 * query にマッチした行の elementKey 一覧 (昇順)
 */
const matchedKeys = (items: JsonRowItem[], query: string): string[] => {
  const structure = structurizeQuery(tokenizeQuery(query));
  expect(structure.length).toBe(1);
  return items.filter((item) => matchByQuery(item, structure[0])).map((item) => item.elementKey).sort();
};

const queryOf = (candidates: ReturnType<typeof buildKeyQueryCandidates>, id: string) => {
  const candidate = candidates.find((c) => c.id === id);
  expect(candidate, `candidate not found: ${id}`).toBeDefined();
  return candidate!.query;
};

const DOC = {
  meta: { status: "ok" },
  items: [
    { id: 1, status: "ok", tags: ["red", "blue"] },
    { id: 2, status: "error", tags: ["red"] },
  ],
};

describe("segmentsOf", () => {
  it("ルートから対象ノードまでのセグメント列を返す (ルート自身は含まない)", () => {
    const items = itemsOf(DOC);
    expect(segmentsOf(findItem(items, "items.1.status"))).toEqual(["items", 1, "status"]);
    expect(segmentsOf(findItem(items, "items.0.tags.1"))).toEqual(["items", 0, "tags", 1]);
  });

  it("ルート行は空配列", () => {
    expect(segmentsOf(itemsOf(DOC)[0])).toEqual([]);
  });
});

describe("buildKeyQueryCandidates: 葉ノード", () => {
  const items = itemsOf(DOC);
  const candidates = buildKeyQueryCandidates(findItem(items, "items.1.status"));

  it("緩和の段と値条件の候補が揃う", () => {
    expect(candidates.map((c) => c.id)).toEqual([
      "exact", "relaxed", "anywhere", "same-value", "owner",
    ]);
  });

  it("完全指定はその1件だけにマッチする", () => {
    const query = queryOf(candidates, "exact");
    expect(query).toBe("$.items.1.status");
    expect(matchedKeys(items, query)).toEqual(["items.1.status"]);
  });

  it("添字緩和は同じ階層の同名キーにマッチする", () => {
    const query = queryOf(candidates, "relaxed");
    expect(query).toBe("$.items.*.status");
    expect(matchedKeys(items, query)).toEqual(["items.0.status", "items.1.status"]);
  });

  it("深さ不問はどの階層の同名キーにもマッチする", () => {
    const query = queryOf(candidates, "anywhere");
    expect(query).toBe("status");
    expect(matchedKeys(items, query)).toEqual(["items.0.status", "items.1.status", "meta.status"]);
  });

  it("値付きは同じ値の項目にマッチする", () => {
    const query = queryOf(candidates, "same-value");
    expect(query).toBe('$.items.*.status:"error"');
    expect(matchedKeys(items, query)).toEqual(["items.1.status"]);
  });

  it("述語はその値を持つ親要素にマッチする", () => {
    const query = queryOf(candidates, "owner");
    expect(query).toBe('$.items.*[$.status:"error"]');
    expect(matchedKeys(items, query)).toEqual(["items.1"]);
  });
});

describe("buildKeyQueryCandidates: 配列添字", () => {
  const items = itemsOf(DOC);
  const candidates = buildKeyQueryCandidates(findItem(items, "items.0.tags.1"));

  it("深さ不問と述語は出さない (裸の添字は意図から遠い)", () => {
    expect(candidates.map((c) => c.id)).toEqual(["exact", "relaxed", "same-value"]);
  });

  it("経路上のすべての添字を緩和する", () => {
    const query = queryOf(candidates, "relaxed");
    expect(query).toBe("$.items.*.tags.*");
    expect(matchedKeys(items, query)).toEqual([
      "items.0.tags.0", "items.0.tags.1", "items.1.tags.0",
    ]);
  });

  it("ラベルは配列向けの言い方にする", () => {
    expect(candidates.find((c) => c.id === "relaxed")!.label).toBe("同じ配列の要素すべて");
  });
});

describe("buildKeyQueryCandidates: コンテナノード", () => {
  const items = itemsOf(DOC);

  it("値系の候補は出ない", () => {
    const candidates = buildKeyQueryCandidates(findItem(items, "meta"));
    expect(candidates.map((c) => c.id)).toEqual(["exact", "anywhere"]);
    expect(queryOf(candidates, "exact")).toBe("$.meta");
    expect(queryOf(candidates, "anywhere")).toBe("meta");
  });

  it("添字が無い経路では緩和候補が完全指定と一致するので落ちる", () => {
    const candidates = buildKeyQueryCandidates(findItem(items, "meta.status"));
    expect(candidates.map((c) => c.id)).not.toContain("relaxed");
  });

  it("配列要素そのものは同じ配列の全要素に緩和できる", () => {
    const candidates = buildKeyQueryCandidates(findItem(items, "items.0"));
    expect(candidates.map((c) => c.id)).toEqual(["exact", "relaxed"]);
    const query = queryOf(candidates, "relaxed");
    expect(query).toBe("$.items.*");
    expect(matchedKeys(items, query)).toEqual(["items.0", "items.1"]);
  });

  it("ルート行では候補を作らない", () => {
    expect(buildKeyQueryCandidates(items[0])).toEqual([]);
  });
});

describe("buildKeyQueryCandidates: 表現できないキー", () => {
  it("キー名に . を含むと候補を作らない", () => {
    const items = itemsOf({ "a.b": 1 });
    expect(buildKeyQueryCandidates(findItem(items, "a.b"))).toEqual([]);
  });

  it("経路上に表現できないキーがあると, 経路に依存する候補だけが落ちる", () => {
    const items = itemsOf({ "a.b": { c: 1 } });
    const candidates = buildKeyQueryCandidates(findItem(items, "a.b.c"));
    // 末尾キーだけを見る「深さ不問」は経路を参照しないので生き残り, 実際にマッチする
    expect(candidates.map((c) => c.id)).toEqual(["anywhere"]);
    expect(matchedKeys(items, queryOf(candidates, "anywhere"))).toEqual(["a.b.c"]);
  });

  it("キー名に空白を含むと候補を作らない", () => {
    const items = itemsOf({ "a b": 1 });
    expect(buildKeyQueryCandidates(findItem(items, "a b"))).toEqual([]);
  });

  it("キー名が * だと候補を作らない (ワイルドカードと区別できない)", () => {
    const items = itemsOf({ "*": 1 });
    expect(buildKeyQueryCandidates(findItem(items, "*"))).toEqual([]);
  });

  it("制御文字入りの値では値系の候補だけが落ちる", () => {
    const items = itemsOf({ a: "x\ny" });
    const candidates = buildKeyQueryCandidates(findItem(items, "a"));
    expect(candidates.map((c) => c.id)).toEqual(["exact", "anywhere"]);
  });
});

describe("述語のアンカー", () => {
  const NESTED = {
    items: [
      { status: "ok", inner: { status: "error" } },
      { status: "error" },
    ],
  };

  it("$ 付きの述語は直下のキーだけを見る", () => {
    const items = itemsOf(NESTED);
    const candidates = buildKeyQueryCandidates(findItem(items, "items.1.status"));
    expect(queryOf(candidates, "owner")).toBe('$.items.*[$.status:"error"]');
    expect(matchedKeys(items, '$.items.*[$.status:"error"]')).toEqual(["items.1"]);
  });

  it("$ を外すと部分木のどこかにあればマッチしてしまう", () => {
    const items = itemsOf(NESTED);
    expect(matchedKeys(items, '$.items.*[status:"error"]')).toEqual(["items.0", "items.1"]);
  });
});

describe("countQueryMatches", () => {
  const items = itemsOf(DOC);

  it("マッチした行数を返す", () => {
    expect(countQueryMatches(items, "$.items.*.status")).toBe(2);
    expect(countQueryMatches(items, "status")).toBe(3);
    expect(countQueryMatches(items, "$.nothing")).toBe(0);
  });

  it("構文エラーや空クエリでは null", () => {
    expect(countQueryMatches(items, '$.a:"')).toBeNull();
    expect(countQueryMatches(items, "")).toBeNull();
  });
});
