import {
  JsonRowItem,
  JsonStats,
  JsonValueObject,
  JsonValueObjectArray,
  JsonValueObjectMap,
  appendRowItem,
  isLeafType,
  makeVOTree,
  wireNextSiblingOrParent,
  wireSiblings,
} from "./jetson";

export type DiffStatus =
  | "same"          // 葉: 値が一致 / コンテナ: 子孫まで完全一致
  | "added"         // 新側にのみ存在
  | "removed"       // 旧側にのみ存在
  | "changed"       // 葉: 値が変化 (変更前/変更後の2行ペアで出力される)
  | "child_changed" // コンテナ: 自身は両側に存在するが子孫に差分がある

export type DiffAnnotation = {
  status: DiffStatus;
  /**
   * status === "changed" の葉のみ: 変更前 (old) の行か変更後 (new) の行か
   */
  side?: "old" | "new";
};

/**
 * diff ビューの行アイテム.
 * JsonRowItem の diff 注釈スロットを必須化した型で,
 * 既存の表示パイプライン (ナローイング・検索・フォールディング・仮想スクロール) にそのまま流せる.
 * index / lineNumber / rowItems などは両ドキュメントを merge した空間で振り直したもの.
 */
export type DiffRowItem = JsonRowItem & {
  rowItems: DiffRowItem[];
  childs?: DiffRowItem[];
  diff: DiffAnnotation;
};

/**
 * 差分ナビゲーションの対象行かどうか.
 * changed は変更前/変更後の2行ペアで表示されるため,
 * 1つの変更で2回止まらないよう新側の行だけを対象にする.
 */
export function isChangedDiffRow(item: JsonRowItem): boolean {
  if (!item.diff) { return false; }
  const { status, side } = item.diff;
  if (status === "changed") { return side !== "old"; }
  return status === "added" || status === "removed";
}

export type DiffStats = {
  /** 新側にのみ存在する行数 */
  added: number;
  /** 旧側にのみ存在する行数 */
  removed: number;
  /** 値が変化した葉の数 */
  changed: number;
};

type ParentRef = {
  item: DiffRowItem;
  itemKey: string | number;
};

type BuildContext = {
  items: DiffRowItem[];
  branch: DiffRowItem[];
  stats: JsonStats;
  diffStats: DiffStats;
};

/**
 * 行を1つ生成して ctx に積み, diff 注釈を付ける.
 */
function createRow(
  ctx: BuildContext,
  right: JsonValueObject,
  status: DiffStatus,
  parent: ParentRef | undefined,
  side?: "old" | "new",
): DiffRowItem {
  const item = appendRowItem(ctx.items, ctx.branch, ctx.stats, right, parent) as DiffRowItem;
  item.diff = side ? { status, side } : { status };
  return item;
}

/**
 * 片側にしか存在しない部分木を, 丸ごと added / removed として出力する.
 */
function emitSubtree(
  ctx: BuildContext,
  vo: JsonValueObject,
  status: "added" | "removed",
  parent: ParentRef | undefined,
): DiffRowItem {
  const item = createRow(ctx, vo, status, parent);
  ctx.diffStats[status] += 1;

  if (vo.type === "array" || vo.type === "map") {
    item.childs = [];
    ctx.branch.push(item);
    const children = vo.type === "array"
      ? vo.value.map((child, i) => emitSubtree(ctx, child, status, { item, itemKey: i }))
      : Object.entries(vo.value).map(([key, child]) => emitSubtree(ctx, child, status, { item, itemKey: key }));
    ctx.branch.pop();
    wireSiblings(children);
  }
  return item;
}

/**
 * 値が変化した葉を, 変更前 (旧) / 変更後 (新) の2行ペアとして出力する.
 * 両行を対等な見た目で表示するための表現で,
 * added / removed とは背景色とグリフで区別される.
 */
function emitChangedPair(
  ctx: BuildContext,
  oldVO: JsonValueObject,
  newVO: JsonValueObject,
  parent: ParentRef | undefined,
): DiffRowItem[] {
  const oldRow = createRow(ctx, oldVO, "changed", parent, "old");
  const newRow = createRow(ctx, newVO, "changed", parent, "new");
  ctx.diffStats.changed += 1;
  return [oldRow, newRow];
}

type ChildEntry = {
  itemKey: string | number;
  oldChild?: JsonValueObject;
  newChild?: JsonValueObject;
};

/**
 * 同型コンテナ同士の子を対応付けたエントリ列を返す.
 * - map: 旧側の出現順に並べ, 新側にのみあるキーを末尾に足す (キーの並び替えは差分にしない)
 * - array: 添字対応 (v1 制限)
 */
function containerEntries(
  oldVO: JsonValueObjectArray | JsonValueObjectMap,
  newVO: JsonValueObjectArray | JsonValueObjectMap,
): ChildEntry[] {
  if (oldVO.type === "array" && newVO.type === "array") {
    const length = Math.max(oldVO.value.length, newVO.value.length);
    return Array.from({ length }, (unused, i) => ({
      itemKey: i,
      oldChild: oldVO.value[i],
      newChild: newVO.value[i],
    }));
  }
  if (oldVO.type === "map" && newVO.type === "map") {
    const oldMap = oldVO.value;
    const newMap = newVO.value;
    const keys = [
      ...Object.keys(oldMap),
      ...Object.keys(newMap).filter((key) => !(key in oldMap)),
    ];
    return keys.map((key) => ({
      itemKey: key,
      oldChild: oldMap[key],
      newChild: newMap[key],
    }));
  }
  throw new Error("unreachable");
}

/**
 * 両側に存在するキーパスを処理する.
 * - 葉同士: 値比較で same / changed (型違いの葉同士も changed)
 * - コンテナ同士(同型): 子をマージして再帰. 子孫に差分があれば child_changed
 * - コンテナが絡む型違い: 置換とみなし, removed 部分木 + added 部分木の2行を出力
 * @returns rows: このキーパスに対して出力した行 / changed: 部分木内に差分があるか
 */
function emitBoth(
  ctx: BuildContext,
  oldVO: JsonValueObject,
  newVO: JsonValueObject,
  parent: ParentRef | undefined,
): { rows: DiffRowItem[]; changed: boolean } {
  if (oldVO.type !== newVO.type) {
    if (isLeafType(oldVO.type) && isLeafType(newVO.type)) {
      return { rows: emitChangedPair(ctx, oldVO, newVO, parent), changed: true };
    }
    const removed = emitSubtree(ctx, oldVO, "removed", parent);
    const added = emitSubtree(ctx, newVO, "added", parent);
    return { rows: [removed, added], changed: true };
  }

  // コンテナ同士 (同型)
  if ((oldVO.type === "array" && newVO.type === "array")
    || (oldVO.type === "map" && newVO.type === "map")) {
    const item = createRow(ctx, newVO, "same", parent);
    item.childs = [];
    ctx.branch.push(item);
    const children: DiffRowItem[] = [];
    let changed = false;
    for (const entry of containerEntries(oldVO, newVO)) {
      const childParent = { item, itemKey: entry.itemKey };
      if (entry.oldChild && entry.newChild) {
        const result = emitBoth(ctx, entry.oldChild, entry.newChild, childParent);
        children.push(...result.rows);
        changed = changed || result.changed;
      } else if (entry.oldChild) {
        children.push(emitSubtree(ctx, entry.oldChild, "removed", childParent));
        changed = true;
      } else if (entry.newChild) {
        children.push(emitSubtree(ctx, entry.newChild, "added", childParent));
        changed = true;
      }
    }
    ctx.branch.pop();
    wireSiblings(children);
    item.diff.status = changed ? "child_changed" : "same";
    return { rows: [item], changed };
  }

  // 葉同士 (同型)
  if (oldVO.value === newVO.value) {
    return { rows: [createRow(ctx, newVO, "same", parent)], changed: false };
  }
  return { rows: emitChangedPair(ctx, oldVO, newVO, parent), changed: true };
}

/**
 * 2つの JSON 値の構造 diff を, 表示パイプラインへ流せる行アイテム列として返す.
 * 旧側 (oldJson) から見た新側 (newJson) への変化を表す.
 */
export function diffJson(
  oldJson: any,
  newJson: any,
  newText?: string,
): { items: DiffRowItem[]; stats: JsonStats; diffStats: DiffStats } {
  const ctx: BuildContext = {
    items: [],
    branch: [],
    stats: {
      item_count: 0,
      max_depth: 0,
      max_key_length: [],
      char_count: newText?.length ?? 0,
    },
    diffStats: {
      added: 0,
      removed: 0,
      changed: 0,
    },
  };
  const roots = emitBoth(ctx, makeVOTree(oldJson), makeVOTree(newJson), undefined);
  // ルートが置換 (2行) になった場合の兄弟接続
  wireSiblings(roots.rows);
  wireNextSiblingOrParent(ctx.items);
  return {
    items: ctx.items,
    stats: ctx.stats,
    diffStats: ctx.diffStats,
  };
}
