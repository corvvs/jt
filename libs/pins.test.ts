import { describe, expect, it } from "vitest";
import {
  PIN_VALUE_PREVIEW_MAX_LENGTH,
  pinValuePreview,
  popNarrowedRangesToInclude,
} from "./pins";
import { JsonValueObject } from "./jetson";

describe("pinValuePreview", () => {
  it("リーフは JSON 表現をそのまま出す", () => {
    expect(pinValuePreview({ type: "string", value: "hello" })).toBe('"hello"');
    expect(pinValuePreview({ type: "number", value: 42 })).toBe("42");
    expect(pinValuePreview({ type: "boolean", value: false })).toBe("false");
    expect(pinValuePreview({ type: "null", value: null })).toBe("null");
  });

  it("長いリーフは上限で切って省略記号を付ける", () => {
    const long = "a".repeat(PIN_VALUE_PREVIEW_MAX_LENGTH * 2);
    const preview = pinValuePreview({ type: "string", value: long });
    expect(preview.length).toBe(PIN_VALUE_PREVIEW_MAX_LENGTH);
    expect(preview.endsWith("…")).toBe(true);
  });

  it("コンテナは中身を展開せず要素数だけ出す", () => {
    const map: JsonValueObject = {
      type: "map",
      value: {
        a: { type: "number", value: 1 },
        b: { type: "number", value: 2 },
      },
    };
    expect(pinValuePreview(map)).toBe("{…} 2 keys");

    const array: JsonValueObject = {
      type: "array",
      value: [{ type: "null", value: null }],
    };
    expect(pinValuePreview(array)).toBe("[…] 1 items");
  });
});

describe("popNarrowedRangesToInclude", () => {
  const stack = [
    { from: 0, to: 100 },
    { from: 10, to: 50 },
    { from: 20, to: 30 },
  ];

  it("top が index を含むなら何も変えず同じ参照を返す", () => {
    expect(popNarrowedRangesToInclude(stack, 25)).toBe(stack);
  });

  it("index を含む範囲が top になるまで pop する", () => {
    expect(popNarrowedRangesToInclude(stack, 40)).toEqual([
      { from: 0, to: 100 },
      { from: 10, to: 50 },
    ]);
    expect(popNarrowedRangesToInclude(stack, 99)).toEqual([
      { from: 0, to: 100 },
    ]);
  });

  it("to は半開区間の外なので含まない", () => {
    expect(popNarrowedRangesToInclude(stack, 30)).toEqual([
      { from: 0, to: 100 },
      { from: 10, to: 50 },
    ]);
  });

  it("どの範囲にも含まれなければ空になる", () => {
    expect(popNarrowedRangesToInclude(stack, 200)).toEqual([]);
  });

  it("空のスタックはそのまま", () => {
    expect(popNarrowedRangesToInclude([], 0)).toEqual([]);
  });
});
