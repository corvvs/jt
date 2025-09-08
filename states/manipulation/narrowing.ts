import { JsonRowItem } from "@/libs/jetson";
import { atom, useAtom } from "jotai";
import _ from "lodash";

type IndexRange = { from: number; to: number; };
type NarrowingStack = IndexRange[];
export const defaultNarrowedRange: NarrowingStack = [];

const narrowedRangeAtom = atom<NarrowingStack>(defaultNarrowedRange);

const deriveNarrowdRange = (index: number, items: JsonRowItem[]) => {
  const indexFrom = index;
  const itemFrom = items[indexFrom];
  const fromRowsLength = itemFrom.rowItems.length;
  let itemTo: JsonRowItem | undefined = undefined;
  for (let i = indexFrom + 1; i < items.length; i++) {
    // itemTo = itemFromから始まったナロイングが終わる場所にあるアイテムを探す.
    // ナロイングによる表示範囲は半開区間 [itemFrom, itemTo) で表される.
    // 判定条件:
    // - itemFrom以降で, itemFromと同じか浅い階層にある最初のアイテム
    const it = items[i];
    if (it.rowItems.length <= fromRowsLength
        || it.rowItems[fromRowsLength].elementKey !== itemFrom.elementKey) {
      itemTo = it;
      break;
    }
  }
  const indexTo = itemTo ? itemTo.index : items.length;
  return {
    from: indexFrom, to: indexTo,
  };
};

export const useNarrowing = () => {
  const [narrowedRanges, setNarrowedRangesRaw] = useAtom(narrowedRangeAtom);
  const pushNarrowedRange = (index: number, allItems: JsonRowItem[]) => {
    const range = deriveNarrowdRange(index, allItems);
    if (!range) { return; }
    setNarrowedRangesRaw(prev => [...prev, range]);
  };
  const popNarrowedRange = (topIndex?: number) => {
    if (_.isFinite(topIndex)) {
      if (topIndex! < 0) {
        setNarrowedRangesRaw(prev => _.dropRight(prev));
        return;
      } else if (topIndex! < narrowedRanges.length) {
        setNarrowedRangesRaw(prev => _.slice(prev, 0, topIndex! + 1));
        return;
      }
    }
    setNarrowedRangesRaw(defaultNarrowedRange);
  };

  return {
    narrowedRanges,
    setNarrowedRangesRaw,
    pushNarrowedRange,
    popNarrowedRange,
  };
}