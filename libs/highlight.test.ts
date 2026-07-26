import { describe, expect, it } from "vitest";
import { flattenJson } from "./jetson";
import { HighlightMaps, HighlightRule, computeHighlightMaps } from "./highlight";

const LOG_JSON = {
  items: [
    { level: "error", message: "boom" },
    { level: "warn", message: "slow" },
    { level: "error", message: "bad error" },
  ],
};

const { items } = flattenJson(LOG_JSON, JSON.stringify(LOG_JSON));

const rule = (over: Partial<HighlightRule>): HighlightRule => ({
  id: "r0",
  name: "",
  query: "",
  mode: "advanced",
  color: 0,
  enabled: true,
  createdAt: 0,
  ...over,
});

/** rowColor を elementKey キーに変換する (index はテストで読めないため) */
const colorsByKey = (maps: HighlightMaps): { [key: string]: number } => {
  const out: { [key: string]: number } = {};
  for (const item of items) {
    const color = maps.rowColor[item.index];
    if (color !== undefined) { out[item.elementKey] = color; }
  }
  return out;
};

describe("computeHighlightMaps", () => {
  it("advanced ルールがマッチした行に色を割り当てる", () => {
    const maps = computeHighlightMaps(items, [
      rule({ id: "err", query: 'items.*.level:"error"', color: 2 }),
    ]);
    expect(colorsByKey(maps)).toEqual({
      "items.0.level": 2,
      "items.2.level": 2,
    });
    expect(maps.counts).toEqual({ err: 2 });
  });

  it("simple ルールはキー・値の部分一致で色を割り当てる", () => {
    const maps = computeHighlightMaps(items, [
      rule({ id: "boom", query: "boom", mode: "simple", color: 5 }),
    ]);
    expect(colorsByKey(maps)).toEqual({ "items.0.message": 5 });
    expect(maps.counts).toEqual({ boom: 1 });
  });

  it("複数ルールがマッチした行はリスト順で最初のルールが勝つ", () => {
    const narrow = rule({ id: "narrow", query: 'items.*[level:"error"]', color: 1 });
    const broad = rule({ id: "broad", query: "$.items.*", color: 3 });

    const maps = computeHighlightMaps(items, [narrow, broad]);
    expect(colorsByKey(maps)).toEqual({
      "items.0": 1, // narrow が先勝ち
      "items.1": 3,
      "items.2": 1,
    });

    // 順序を入れ替えると broad が全要素を取る
    const swapped = computeHighlightMaps(items, [broad, narrow]);
    expect(colorsByKey(swapped)).toEqual({
      "items.0": 3,
      "items.1": 3,
      "items.2": 3,
    });
  });

  it("counts は先勝ちと無関係に全ルール独立で数える (0件も返る)", () => {
    const maps = computeHighlightMaps(items, [
      rule({ id: "narrow", query: 'items.*[level:"error"]', color: 1 }),
      rule({ id: "broad", query: "$.items.*", color: 3 }),
      rule({ id: "none", query: 'items.*.level:"fatal"', color: 4 }),
    ]);
    expect(maps.counts).toEqual({ narrow: 2, broad: 3, none: 0 });
  });

  it("無効化されたルールと matcher を構築できないルールは評価されない", () => {
    const maps = computeHighlightMaps(items, [
      rule({ id: "disabled", query: "$.items.*", enabled: false }),
      rule({ id: "syntax-error", query: 'level:"err' }), // 未終了の引用符
      rule({ id: "too-short", query: "e", mode: "simple" }), // 2文字未満
      rule({ id: "empty", query: "" }),
    ]);
    expect(maps.rowColor).toEqual({});
    // counts にも現れない (パネルはこれを「無効なクエリ」の表示に使う)
    expect(maps.counts).toEqual({});
  });

  it("ルールが無ければ空の maps を返す", () => {
    const maps = computeHighlightMaps(items, []);
    expect(maps.rowColor).toEqual({});
    expect(maps.counts).toEqual({});
  });
});
