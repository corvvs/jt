import { describe, expect, it } from "vitest";
import { composeFacetQuery } from "./facet";
import { flattenJson } from "./jetson";
import { tokenizeQuery } from "./advanced_query/tokenizer";
import { structurizeQuery } from "./advanced_query/parser";
import { matchByQuery } from "./advanced_query/matcher";

/**
 * query にマッチした行の elementKey 一覧 (文書順)
 */
const matchedKeys = (json: any, query: string): string[] => {
  const structure = structurizeQuery(tokenizeQuery(query));
  expect(structure.length).toBe(1);
  const { items } = flattenJson(json, JSON.stringify(json));
  return items.filter((item) => matchByQuery(item, structure[0])).map((item) => item.elementKey);
};

describe("composeFacetQuery: 合成", () => {
  it("文字列は引用形で合成する", () => {
    expect(composeFacetQuery("items.*.status", '"error"')).toBe('$.items.*.status:"error"');
  });

  it("数値は裸で合成する (整数・小数・負数)", () => {
    expect(composeFacetQuery("meta.count", "42")).toBe("$.meta.count:42");
    expect(composeFacetQuery("items.*.price", "1.5")).toBe("$.items.*.price:1.5");
    expect(composeFacetQuery("a", "-3")).toBe("$.a:-3");
  });

  it("空白・記号入りの文字列も引用形で書ける", () => {
    expect(composeFacetQuery("cat", '"Home & Garden"')).toBe('$.cat:"Home & Garden"');
  });

  it("引用符とバックスラッシュをエスケープする", () => {
    const literal = JSON.stringify('say "hi" \\ ok');
    expect(composeFacetQuery("msg", literal)).toBe('$.msg:"say \\"hi\\" \\\\ ok"');
  });

  it("空文字列の値", () => {
    expect(composeFacetQuery("empty", '""')).toBe('$.empty:""');
  });

  it("ナローイング中の rootKey 前置パス (数値インデックス入り)", () => {
    expect(composeFacetQuery("items.3.payload.status", '"ok"')).toBe('$.items.3.payload.status:"ok"');
  });

  it("真偽値と null は裸で合成する", () => {
    expect(composeFacetQuery("a.flag", "true")).toBe("$.a.flag:true");
    expect(composeFacetQuery("a.flag", "false")).toBe("$.a.flag:false");
    expect(composeFacetQuery("a.ratio", "null")).toBe("$.a.ratio:null");
  });
});

describe("composeFacetQuery: 合成不能 (null)", () => {
  const nullCases: [string, string, string][] = [
    ["", '"x"', "キーパスが空"],
    ["a b.c", '"x"', "キー名に空白"],
    ["a:b", '"x"', "キー名に構造文字 (:)"],
    ["arr[0].c", '"x"', "キー名に構造文字 ([ ])"],
    ["pre*fix.c", '"x"', "キー名に部分ワイルドカード"],
    ["a..b", '"x"', "空セグメント"],
  ];
  for (const [keypath, literal, label] of nullCases) {
    it(label, () => {
      expect(composeFacetQuery(keypath, literal)).toBeNull();
    });
  }

  it('配列マージの "*" セグメントは許可される', () => {
    expect(composeFacetQuery("items.*.status", '"x"')).not.toBeNull();
  });

  it("制御文字入りの値", () => {
    const literal = JSON.stringify("line1" + String.fromCharCode(10) + "line2");
    expect(composeFacetQuery("msg", literal)).toBeNull();
  });

  it("JSON として壊れたリテラル", () => {
    expect(composeFacetQuery("a", "not json")).toBeNull();
  });
});

describe("composeFacetQuery: マッチングとの往復", () => {
  const DOC = {
    items: [
      { status: "error", price: 1.5 },
      { status: "ok", note: "error" },
    ],
    meta: { count: 42, tag: "42" },
  };

  it("文字列ファセットは該当キーパスの該当値だけにマッチ (note:error に釣られない)", () => {
    const query = composeFacetQuery("items.*.status", '"error"')!;
    expect(matchedKeys(DOC, query)).toEqual(["items.0.status"]);
  });

  it("数値ファセット (整数・小数)", () => {
    expect(matchedKeys(DOC, composeFacetQuery("meta.count", "42")!)).toEqual(["meta.count"]);
    expect(matchedKeys(DOC, composeFacetQuery("items.*.price", "1.5")!)).toEqual(["items.0.price"]);
  });

  it("文字列 '42' のファセットは数値 42 にマッチしない", () => {
    expect(matchedKeys(DOC, composeFacetQuery("meta.tag", '"42"')!)).toEqual(["meta.tag"]);
  });

  it("引用符・バックスラッシュ入りの値の往復", () => {
    const doc = { msg: 'say "hi" \\ ok', other: "x" };
    const query = composeFacetQuery("msg", JSON.stringify(doc.msg))!;
    expect(matchedKeys(doc, query)).toEqual(["msg"]);
  });

  it("真偽値と null のファセットの往復", () => {
    const doc = { rows: [{ flag: true, ratio: null }, { flag: false, ratio: 0.5 }] };
    expect(matchedKeys(doc, composeFacetQuery("rows.*.flag", "true")!)).toEqual(["rows.0.flag"]);
    expect(matchedKeys(doc, composeFacetQuery("rows.*.flag", "false")!)).toEqual(["rows.1.flag"]);
    expect(matchedKeys(doc, composeFacetQuery("rows.*.ratio", "null")!)).toEqual(["rows.0.ratio"]);
  });
});
