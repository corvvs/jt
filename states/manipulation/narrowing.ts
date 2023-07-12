import { JsonRowItem } from "@/libs/jetson";
import { atom, useAtom } from "jotai";
import _ from "lodash";

type IndexRange = { from: number; to: number; };
export type NarrowingStack = IndexRange[];
export const defaultNarrowedRange: NarrowingStack = [];

const narrowedRangeAtom = atom<NarrowingStack>(defaultNarrowedRange);

const deriveNarrowdRange = (index: number, items: JsonRowItem[]) => {
  const indexFrom = index;
  const itemFrom = items[indexFrom];
  const itemTo = _.slice(items, indexFrom + 1).find(itemTo => {
    return itemTo.rowItems.length <= itemFrom.rowItems.length || itemTo.rowItems[itemFrom.rowItems.length].elementKey !== itemFrom.elementKey;
  });
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