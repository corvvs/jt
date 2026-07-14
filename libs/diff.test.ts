import { describe, expect, it } from "vitest";
import { DiffRowItem, diffJson, isChangedDiffRow } from "./diff";

/**
 * elementKey で行を引く (置換で同一キーが2行になるケースでは使わないこと)
 */
function rowOf(items: DiffRowItem[], elementKey: string): DiffRowItem {
  const found = items.filter((item) => item.elementKey === elementKey);
  expect(found.length).toBe(1);
  return found[0];
}

function rowsOf(items: DiffRowItem[], elementKey: string): DiffRowItem[] {
  return items.filter((item) => item.elementKey === elementKey);
}

describe("diffJson: 葉", () => {
  it("同値の葉は same", () => {
    const { items, diffStats } = diffJson(5, 5);
    expect(items.length).toBe(1);
    expect(items[0].diff.status).toBe("same");
    expect(diffStats).toEqual({ added: 0, removed: 0, changed: 0 });
  });

  it("値が変わった葉は 旧/新 の changed 2行ペアになる", () => {
    const { items, diffStats } = diffJson(5, 6);
    expect(items.length).toBe(2);
    expect(items[0].diff).toEqual({ status: "changed", side: "old" });
    expect(items[0].right).toEqual({ type: "number", value: 5 });
    expect(items[1].diff).toEqual({ status: "changed", side: "new" });
    expect(items[1].right).toEqual({ type: "number", value: 6 });
    // ペアは兄弟として接続される
    expect(items[0].nextSibling).toBe(items[1]);
    // カウントはペアで1
    expect(diffStats.changed).toBe(1);
  });

  it("葉同士の型変化も changed ペア (置換にしない)", () => {
    const { items, diffStats } = diffJson("5", 5);
    expect(items.length).toBe(2);
    expect(items[0].diff).toEqual({ status: "changed", side: "old" });
    expect(items[0].right).toEqual({ type: "string", value: "5" });
    expect(items[1].diff).toEqual({ status: "changed", side: "new" });
    expect(diffStats).toEqual({ added: 0, removed: 0, changed: 1 });
  });

  it("差分ナビゲーションは changed ペアの新側だけを対象にする", () => {
    const { items } = diffJson({ a: 1, b: 2 }, { a: 9, c: 3 });
    const pair = rowsOf(items, "a");
    expect(isChangedDiffRow(pair[0])).toBe(false); // old 側
    expect(isChangedDiffRow(pair[1])).toBe(true);  // new 側
    expect(isChangedDiffRow(rowOf(items, "b"))).toBe(true); // removed
    expect(isChangedDiffRow(rowOf(items, "c"))).toBe(true); // added
    expect(isChangedDiffRow(rowOf(items, ""))).toBe(false); // child_changed
  });

  it("null 同士は same", () => {
    const { items } = diffJson(null, null);
    expect(items[0].diff.status).toBe("same");
  });
});

describe("diffJson: map", () => {
  it("キーの追加・削除を added / removed にする", () => {
    const { items, diffStats } = diffJson({ a: 1, b: 2 }, { a: 1, c: 3 });
    expect(rowOf(items, "").diff.status).toBe("child_changed");
    expect(rowOf(items, "a").diff.status).toBe("same");
    expect(rowOf(items, "b").diff.status).toBe("removed");
    expect(rowOf(items, "c").diff.status).toBe("added");
    expect(diffStats).toEqual({ added: 1, removed: 1, changed: 0 });
  });

  it("キー順は 旧側の出現順 → 新側にのみあるキー", () => {
    const { items } = diffJson({ a: 1, b: 2 }, { c: 3, a: 1 });
    expect(items.map((item) => item.elementKey)).toEqual(["", "a", "b", "c"]);
  });

  it("キーの並び替えだけでは差分にならない", () => {
    const { items, diffStats } = diffJson({ a: 1, b: 2 }, { b: 2, a: 1 });
    expect(rowOf(items, "").diff.status).toBe("same");
    expect(diffStats).toEqual({ added: 0, removed: 0, changed: 0 });
  });

  it("内部に差分のない部分木コンテナは same に保つ", () => {
    const { items } = diffJson(
      { a: { x: 1 }, b: 2 },
      { a: { x: 1 }, b: 3 },
    );
    expect(rowOf(items, "a").diff.status).toBe("same");
    expect(rowOf(items, "a.x").diff.status).toBe("same");
    expect(rowsOf(items, "b").map((row) => row.diff.status)).toEqual(["changed", "changed"]);
    expect(rowOf(items, "").diff.status).toBe("child_changed");
  });

  it("child_changed は葉の変化からルートまで連鎖する", () => {
    const { items } = diffJson(
      { a: { b: { c: 1 } } },
      { a: { b: { c: 2 } } },
    );
    expect(rowsOf(items, "a.b.c").map((row) => row.diff.status)).toEqual(["changed", "changed"]);
    expect(rowOf(items, "a.b").diff.status).toBe("child_changed");
    expect(rowOf(items, "a").diff.status).toBe("child_changed");
    expect(rowOf(items, "").diff.status).toBe("child_changed");
  });
});

describe("diffJson: array", () => {
  it("末尾要素の追加は added", () => {
    const { items, diffStats } = diffJson([1, 2], [1, 2, 3]);
    expect(rowOf(items, "0").diff.status).toBe("same");
    expect(rowOf(items, "1").diff.status).toBe("same");
    expect(rowOf(items, "2").diff.status).toBe("added");
    expect(diffStats.added).toBe(1);
  });

  it("末尾要素の削除は removed", () => {
    const { items, diffStats } = diffJson([1, 2, 3], [1]);
    expect(rowOf(items, "1").diff.status).toBe("removed");
    expect(rowOf(items, "2").diff.status).toBe("removed");
    expect(diffStats.removed).toBe(2);
  });

  it("同一添字の値変化は changed ペア", () => {
    const { items } = diffJson([1], [2]);
    const pair = rowsOf(items, "0");
    expect(pair.map((row) => row.diff)).toEqual([
      { status: "changed", side: "old" },
      { status: "changed", side: "new" },
    ]);
    expect(rowOf(items, "").diff.status).toBe("child_changed");
  });
});

describe("diffJson: 置換 (コンテナが絡む型違い)", () => {
  it("map → array は removed 部分木 + added 部分木の2行ペア", () => {
    const { items, diffStats } = diffJson({ a: { x: 1 } }, { a: [1] });
    const pair = rowsOf(items, "a");
    expect(pair.length).toBe(2);
    expect(pair[0].diff.status).toBe("removed");
    expect(pair[0].right.type).toBe("map");
    expect(pair[1].diff.status).toBe("added");
    expect(pair[1].right.type).toBe("array");
    // 子孫も side ごとに出力される
    expect(rowOf(items, "a.x").diff.status).toBe("removed");
    expect(rowOf(items, "a.0").diff.status).toBe("added");
    // 置換ペアは兄弟として接続される
    expect(pair[0].nextSibling).toBe(pair[1]);
    expect(pair[1].previousSibling).toBe(pair[0]);
    // 行数カウント: removed = a + a.x, added = a + a.0
    expect(diffStats).toEqual({ added: 2, removed: 2, changed: 0 });
  });

  it("葉 → コンテナも置換になる", () => {
    const { items } = diffJson({ a: 1 }, { a: [1] });
    const pair = rowsOf(items, "a");
    expect(pair.length).toBe(2);
    expect(pair[0].diff.status).toBe("removed");
    expect(pair[1].diff.status).toBe("added");
  });

  it("ルートの置換: 2ルート行が兄弟接続され, 旧側部分木のフォールドスキップが新側に届く", () => {
    const { items } = diffJson({ a: 1 }, [1]);
    const roots = items.filter((item) => item.elementKey === "");
    expect(roots.length).toBe(2);
    expect(roots[0].diff.status).toBe("removed");
    expect(roots[1].diff.status).toBe("added");
    expect(roots[0].nextSibling).toBe(roots[1]);
    // removed ルートの子 a のフォールドスキップ先は added ルート
    const removedChild = rowOf(items, "a");
    expect(removedChild.nextSiblingOrParent).toBe(roots[1]);
  });

  it("空コンテナ同士の型違いも置換として動く", () => {
    const { items } = diffJson([], {});
    expect(items.length).toBe(2);
    expect(items[0].diff.status).toBe("removed");
    expect(items[1].diff.status).toBe("added");
  });
});

describe("diffJson: 行アイテムとしての整合性", () => {
  it("index は連番, lineNumber は index + 1", () => {
    const { items } = diffJson(
      { a: [1, 2], b: { x: "s" } },
      { a: [1], c: true },
    );
    items.forEach((item, i) => {
      expect(item.index).toBe(i);
      expect(item.lineNumber).toBe(i + 1);
    });
  });

  it("items は親 → 子の DFS 順で, rowItems が祖先列になっている", () => {
    const { items } = diffJson({ a: { b: 1 } }, { a: { b: 2 } });
    const pair = rowsOf(items, "a.b");
    expect(pair.length).toBe(2);
    for (const row of pair) {
      expect(row.rowItems.map((item) => item.elementKey)).toEqual(["", "a"]);
      expect(row.parent?.elementKey).toBe("a");
    }
  });

  it("stats.item_count が行数と一致する", () => {
    const { items, stats } = diffJson({ a: 1 }, { a: 1, b: [1, 2] });
    expect(stats.item_count).toBe(items.length);
  });

  it("完全一致のドキュメントは diffStats がすべて 0", () => {
    const doc = { a: [1, "s", null, { x: true }], b: { c: [] } };
    const { items, diffStats } = diffJson(doc, doc);
    expect(diffStats).toEqual({ added: 0, removed: 0, changed: 0 });
    for (const item of items) {
      expect(item.diff.status).toBe("same");
    }
  });
});
