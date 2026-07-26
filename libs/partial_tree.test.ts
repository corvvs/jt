import { describe, expect, it } from "vitest";
import { extractSubtree } from "./partial_tree";
import { JsonRowItem, flattenJson, segmentsOf } from "./jetson";

const itemsOf = (json: any): JsonRowItem[] => flattenJson(json, JSON.stringify(json)).items;

/**
 * elementKey で行を引き, その行のセグメント列で部分木を取り出す (実際の呼び出しと同じ経路)
 */
const subtreeAt = (json: any, elementKey: string, occurrence = 0) => {
  const items = itemsOf(json).filter((i) => i.elementKey === elementKey);
  expect(items.length, `item not found: ${elementKey}`).toBeGreaterThan(occurrence);
  return extractSubtree(json, segmentsOf(items[occurrence]));
};

describe("extractSubtree", () => {
  const DOC = {
    meta: { count: 42 },
    items: [
      { id: 1, tags: ["red", "blue"] },
      { id: 2, tags: [] },
    ],
  };

  it("空のセグメント列はドキュメント全体", () => {
    expect(extractSubtree(DOC, [])).toBe(DOC);
  });

  it("オブジェクトのキーで辿る", () => {
    expect(subtreeAt(DOC, "meta")).toEqual({ count: 42 });
    expect(subtreeAt(DOC, "meta.count")).toBe(42);
  });

  it("配列の添字で辿る", () => {
    expect(subtreeAt(DOC, "items.0")).toEqual({ id: 1, tags: ["red", "blue"] });
    expect(subtreeAt(DOC, "items.0.tags.1")).toBe("blue");
  });

  it("空配列・空オブジェクトも取り出せる", () => {
    expect(subtreeAt(DOC, "items.1.tags")).toEqual([]);
    expect(subtreeAt({ a: {} }, "a")).toEqual({});
  });

  it("キー名に . を含んでいてもリテラルなキーとして引ける", () => {
    // ドット結合したキーパス文字列を渡していた頃は, 入れ子側 (2) を取ってしまっていた
    const doc: any = { "a.b": { c: 1 }, a: { b: { c: 2 } } };
    const items = itemsOf(doc);
    const literal = items.find((i) => i.itemKey === "a.b")!;
    expect(extractSubtree(doc, segmentsOf(literal))).toEqual({ c: 1 });

    const nested = items.find((i) => i.itemKey === "b")!;
    expect(extractSubtree(doc, segmentsOf(nested))).toEqual({ c: 2 });
  });

  it("キー名に空白や記号を含んでいても引ける", () => {
    const doc: any = { "a b": { "c:d": 3 } };
    expect(subtreeAt(doc, "a b.c:d")).toBe(3);
  });
});
