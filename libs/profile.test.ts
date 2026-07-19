import { describe, expect, it } from "vitest";
import { makeVOTree } from "./jetson";
import {
  ProfileNode,
  UNIQUE_STRING_MAX_LENGTH,
  UNIQUE_VALUE_CAP,
  keyOccurrenceRate,
  nullRate,
  profileJson,
  toJsonSchema,
  toJsonSchemaDocument,
  uniqueValueEntries,
} from "./profile";

function profileOf(json: any): ProfileNode {
  return profileJson(makeVOTree(json));
}

function childOf(node: ProfileNode, key: string): ProfileNode {
  const child = node.children?.get(key);
  expect(child, `child "${key}" が存在すること`).toBeDefined();
  return child!;
}

describe("profileJson: リーフ", () => {
  it("数値リーフの型と min/max", () => {
    const node = profileOf(5);
    expect(node.total).toBe(1);
    expect(node.typeCounts).toEqual({ number: 1 });
    expect(node.numberStats).toEqual({ min: 5, max: 5 });
  });

  it("文字列リーフはユニーク値を JSON 表現で追跡する", () => {
    const node = profileOf("hello");
    expect(node.typeCounts).toEqual({ string: 1 });
    expect(uniqueValueEntries(node)).toEqual([['"hello"', 1]]);
  });

  it("boolean は true/false を数える", () => {
    const node = profileOf([true, true, false]);
    const elem = childOf(node, "*");
    expect(elem.booleanStats).toEqual({ trueCount: 2, falseCount: 1 });
  });

  it("null は typeCounts に計上される", () => {
    const node = profileOf(null);
    expect(node.typeCounts).toEqual({ null: 1 });
    expect(nullRate(node)).toBe(1);
  });
});

describe("profileJson: map とキー出現率", () => {
  it("map の子はキーごとのノードになる", () => {
    const node = profileOf({ a: 1, b: "x" });
    expect(node.typeCounts).toEqual({ map: 1 });
    expect(Array.from(node.children!.keys())).toEqual(["a", "b"]);
    expect(childOf(node, "a").typeCounts).toEqual({ number: 1 });
    expect(childOf(node, "b").typeCounts).toEqual({ string: 1 });
  });

  it("配列内レコードのオプショナルキーの出現率", () => {
    const node = profileOf([{ a: 1 }, { a: 2, b: 3 }]);
    const elem = childOf(node, "*");
    expect(elem.typeCounts).toEqual({ map: 2 });
    expect(keyOccurrenceRate(elem, childOf(elem, "a"))).toBe(1);
    expect(keyOccurrenceRate(elem, childOf(elem, "b"))).toBe(0.5);
  });
});

describe("profileJson: 配列マージ", () => {
  it('全要素が "*" ノードにマージされ型分布になる', () => {
    const node = profileOf([1, "a", null]);
    expect(node.typeCounts).toEqual({ array: 1 });
    const elem = childOf(node, "*");
    expect(elem.total).toBe(3);
    expect(elem.typeCounts).toEqual({ number: 1, string: 1, null: 1 });
    expect(nullRate(elem)).toBeCloseTo(1 / 3);
  });

  it('ネスト配列は "*" が連なる', () => {
    const node = profileOf([[1, 2], [3]]);
    const outer = childOf(node, "*");
    expect(outer.typeCounts).toEqual({ array: 2 });
    const inner = childOf(outer, "*");
    expect(inner.total).toBe(3);
    expect(inner.numberStats).toEqual({ min: 1, max: 3 });
  });

  it("空配列は子ノードを作らない", () => {
    const node = profileOf([]);
    expect(node.typeCounts).toEqual({ array: 1 });
    expect(node.children).toBeUndefined();
  });

  it("配列ごとに型が違う場合もマージされる (JSONL 相当)", () => {
    const node = profileOf([
      { level: "info" },
      { level: "warn" },
      { level: "info" },
    ]);
    const level = childOf(childOf(node, "*"), "level");
    expect(level.total).toBe(3);
    expect(uniqueValueEntries(level)).toEqual([
      ['"info"', 2],
      ['"warn"', 1],
    ]);
  });
});

describe("profileJson: ユニーク値", () => {
  it("重複は数えられ, 出現数の降順で返る", () => {
    const node = profileOf(["a", "b", "a"]);
    const elem = childOf(node, "*");
    expect(uniqueValueEntries(elem)).toEqual([
      ['"a"', 2],
      ['"b"', 1],
    ]);
    expect(elem.uniqueValues!.capped).toBe(false);
  });

  it("種類数が上限を超えたら打ち切る", () => {
    const values = Array.from({ length: UNIQUE_VALUE_CAP + 50 }, (_, i) => i);
    const node = profileOf(values);
    const elem = childOf(node, "*");
    expect(elem.total).toBe(UNIQUE_VALUE_CAP + 50);
    expect(elem.uniqueValues!.counts.size).toBe(UNIQUE_VALUE_CAP);
    expect(elem.uniqueValues!.capped).toBe(true);
  });

  it("上限打ち切り後も既知の値のカウントは続く", () => {
    const values = [
      ...Array.from({ length: UNIQUE_VALUE_CAP }, (_, i) => i),
      99999, // 新値: 追跡されない
      0, // 既知: カウントされる
    ];
    const node = profileOf(values);
    const elem = childOf(node, "*");
    expect(elem.uniqueValues!.counts.get("0")).toBe(2);
    expect(elem.uniqueValues!.counts.has("99999")).toBe(false);
  });

  it("長すぎる文字列は追跡せず skippedLongStrings に計上する", () => {
    const long = "x".repeat(UNIQUE_STRING_MAX_LENGTH + 1);
    const node = profileOf([long, "short"]);
    const elem = childOf(node, "*");
    expect(elem.skippedLongStrings).toBe(1);
    expect(uniqueValueEntries(elem)).toEqual([['"short"', 1]]);
  });
});

describe("toJsonSchema", () => {
  it("単型リーフ", () => {
    expect(toJsonSchema(profileOf(5))).toEqual({ type: "number" });
  });

  it("混在型は type の配列になる", () => {
    const node = profileOf([1, "a"]);
    expect(toJsonSchema(node)).toEqual({
      type: "array",
      items: { type: ["number", "string"] },
    });
  });

  it("map は object になり, 全インスタンスに存在するキーだけが required", () => {
    const node = profileOf([{ a: 1 }, { a: 2, b: "x" }]);
    expect(toJsonSchema(node)).toEqual({
      type: "array",
      items: {
        type: "object",
        properties: {
          a: { type: "number" },
          b: { type: "string" },
        },
        required: ["a"],
      },
    });
  });

  it("null 混在は type union に現れる", () => {
    const node = profileOf([{ v: 1 }, { v: null }]);
    const items = toJsonSchema(node).items;
    expect(items.properties.v.type).toEqual(["null", "number"]);
  });

  it("toJsonSchemaDocument は $schema をつける", () => {
    const doc = toJsonSchemaDocument(profileOf({ a: 1 }));
    expect(doc.$schema).toBe("http://json-schema.org/draft-07/schema#");
    expect(doc.type).toBe("object");
  });
});
