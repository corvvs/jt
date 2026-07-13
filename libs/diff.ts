import {
  JsonRowItem,
  JsonStats,
  JsonValueObject,
  RegexpIsPreformattedValue,
  makeVOTree,
} from "./jetson";

export type DiffStatus =
  | "same"          // 葉: 値が一致 / コンテナ: 子孫まで完全一致
  | "added"         // 新側にのみ存在
  | "removed"       // 旧側にのみ存在
  | "changed"       // 葉: 値が変化
  | "child_changed" // コンテナ: 自身は両側に存在するが子孫に差分がある

export type DiffAnnotation = {
  status: DiffStatus;
  /**
   * status === "changed" の葉のみ: 旧側の値
   */
  counterpart?: JsonValueObject;
};

/**
 * diff ビューの行アイテム.
 * JsonRowItem と構造互換なので, 既存の表示パイプライン
 * (ナローイング・検索・フォールディング・仮想スクロール) にそのまま流せる.
 * index / lineNumber / rowItems などは両ドキュメントを merge した空間で振り直したもの.
 */
export type DiffRowItem = JsonRowItem & {
  rowItems: DiffRowItem[];
  childs?: DiffRowItem[];
  diff: DiffAnnotation;
};

export function isDiffRowItem(item: JsonRowItem): item is DiffRowItem {
  return "diff" in item;
}

/**
 * 差分のある行 (added / removed / changed) かどうか.
 * 差分ナビゲーションや Diff only 表示の対象判定に使う.
 */
export function isChangedDiffRow(item: JsonRowItem): boolean {
  if (!isDiffRowItem(item)) { return false; }
  const status = item.diff.status;
  return status === "added" || status === "removed" || status === "changed";
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

function isLeafType(type: JsonValueObject["type"]) {
  return type === "string" || type === "number" || type === "boolean" || type === "null";
}

function wireSiblings(children: DiffRowItem[]) {
  for (let i = 1; i < children.length; i += 1) {
    children[i - 1].nextSibling = children[i];
    children[i].previousSibling = children[i - 1];
  }
}

/**
 * 行を1つ生成して ctx に積む. 統計の計上方法は flattenDigger と揃えている.
 */
function createRow(
  ctx: BuildContext,
  right: JsonValueObject,
  status: DiffStatus,
  parent: ParentRef | undefined,
  counterpart?: JsonValueObject,
): DiffRowItem {
  const ownKey = parent ? `${parent.itemKey}` : "";
  const elementKey = parent
    ? (parent.item.elementKey.length > 0
      ? parent.item.elementKey + "." + ownKey
      : ownKey
    ) : "";
  const index = ctx.items.length;
  const item: DiffRowItem = {
    index,
    lineNumber: index + 1,
    elementKey,
    right,
    rowItems: [...ctx.branch],
    stats: {
      item_count: 1,
      max_depth: 0,
    },
    itemKey: parent?.itemKey,
    parent: parent?.item,
    diff: counterpart ? { status, counterpart } : { status },
  };
  ctx.items.push(item);

  ctx.stats.item_count += 1;
  const depth = ctx.branch.length;
  item.rowItems.forEach((rowItem, d) => {
    rowItem.stats.item_count += 1;
    if (rowItem.stats.max_depth < depth - d) {
      rowItem.stats.max_depth = depth - d;
    }
  });
  if (ctx.stats.max_depth < depth) {
    ctx.stats.max_depth = depth;
  }
  if (ctx.stats.max_key_length.length < depth + 1) {
    ctx.stats.max_key_length.push(0);
  }
  if (ctx.stats.max_key_length[depth] < elementKey.length) {
    ctx.stats.max_key_length[depth] = elementKey.length;
  }

  if (right.type === "string") {
    item.isPreformattedValue = RegexpIsPreformattedValue.test(right.value);
  }
  parent?.item.childs?.push(item);
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
    const children: DiffRowItem[] = [];
    if (vo.type === "array") {
      vo.value.forEach((child, i) => {
        children.push(emitSubtree(ctx, child, status, { item, itemKey: i }));
      });
    } else {
      for (const [key, child] of Object.entries(vo.value)) {
        children.push(emitSubtree(ctx, child, status, { item, itemKey: key }));
      }
    }
    ctx.branch.pop();
    wireSiblings(children);
  }
  return item;
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
      const item = createRow(ctx, newVO, "changed", parent, oldVO);
      ctx.diffStats.changed += 1;
      return { rows: [item], changed: true };
    }
    const removed = emitSubtree(ctx, oldVO, "removed", parent);
    const added = emitSubtree(ctx, newVO, "added", parent);
    return { rows: [removed, added], changed: true };
  }

  if (oldVO.type === "map" && newVO.type === "map") {
    const item = createRow(ctx, newVO, "same", parent);
    item.childs = [];
    ctx.branch.push(item);
    const children: DiffRowItem[] = [];
    let changed = false;
    const oldMap = oldVO.value;
    const newMap = newVO.value;
    // 旧側の出現順に並べ, 新側にのみあるキーを末尾に足す (キーの並び替えは差分にしない)
    const keys = [
      ...Object.keys(oldMap),
      ...Object.keys(newMap).filter((key) => !(key in oldMap)),
    ];
    for (const key of keys) {
      const inOld = key in oldMap;
      const inNew = key in newMap;
      if (inOld && inNew) {
        const result = emitBoth(ctx, oldMap[key], newMap[key], { item, itemKey: key });
        children.push(...result.rows);
        changed = changed || result.changed;
      } else if (inOld) {
        children.push(emitSubtree(ctx, oldMap[key], "removed", { item, itemKey: key }));
        changed = true;
      } else {
        children.push(emitSubtree(ctx, newMap[key], "added", { item, itemKey: key }));
        changed = true;
      }
    }
    ctx.branch.pop();
    wireSiblings(children);
    item.diff.status = changed ? "child_changed" : "same";
    return { rows: [item], changed };
  }

  if (oldVO.type === "array" && newVO.type === "array") {
    const item = createRow(ctx, newVO, "same", parent);
    item.childs = [];
    ctx.branch.push(item);
    const children: DiffRowItem[] = [];
    let changed = false;
    const oldValues = oldVO.value;
    const newValues = newVO.value;
    // v1 は添字対応: min(len) までは両側比較, 超過分は added / removed
    const commonLength = Math.min(oldValues.length, newValues.length);
    for (let i = 0; i < commonLength; i += 1) {
      const result = emitBoth(ctx, oldValues[i], newValues[i], { item, itemKey: i });
      children.push(...result.rows);
      changed = changed || result.changed;
    }
    for (let i = commonLength; i < oldValues.length; i += 1) {
      children.push(emitSubtree(ctx, oldValues[i], "removed", { item, itemKey: i }));
      changed = true;
    }
    for (let i = commonLength; i < newValues.length; i += 1) {
      children.push(emitSubtree(ctx, newValues[i], "added", { item, itemKey: i }));
      changed = true;
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
  const item = createRow(ctx, newVO, "changed", parent, oldVO);
  ctx.diffStats.changed += 1;
  return { rows: [item], changed: true };
}

/**
 * 2つの JSON 値の構造 diff を, 表示パイプラインへ流せる行アイテム列として返す.
 * 旧側 (oldJson) から見た新側 (newJson) への変化を表す.
 */
export function diffJson(
  oldJson: any,
  newJson: any,
  rawTexts?: { newText?: string },
): { items: DiffRowItem[]; stats: JsonStats; diffStats: DiffStats } {
  const ctx: BuildContext = {
    items: [],
    branch: [],
    stats: {
      item_count: 0,
      max_depth: 0,
      max_key_length: [],
      char_count: rawTexts?.newText?.length ?? 0,
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
  for (const item of ctx.items) {
    // NOTE: items が 親 → 子 の順に並んでいることを利用している (flattenJson と同じ)
    item.nextSiblingOrParent = item.nextSibling ?? item.parent?.nextSiblingOrParent;
  }
  return {
    items: ctx.items,
    stats: ctx.stats,
    diffStats: ctx.diffStats,
  };
}
