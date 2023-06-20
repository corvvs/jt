import { JsonRowItem } from "@/libs/jetson";
import { atom, useAtom } from "jotai";
import _ from "lodash";

type IndexRange = { from: number; to: number; };

type Manipulation = {
  selectedIndex: number | null;
  narrowedRange: IndexRange | null;
};

const defaultManipulation: Manipulation = {
  selectedIndex: null,
  narrowedRange: null,
};

const manipulationAtom = atom<Manipulation>(defaultManipulation);

const deriveNarrowdRange = (index: number, items: JsonRowItem[]) => {
  const indexFrom = index;
  const itemFrom = items[indexFrom];
  const itemTo = _.slice(items, indexFrom + 1).find(itemTo => {
    return itemFrom.rowItems.length === itemTo.rowItems.length;
  });
  const indexTo = itemTo ? itemTo.index : items.length;
  return {
    from: indexFrom, to: indexTo,
  };
};

export const useManipulation = () => {
  const [manipulation, setManipulation] = useAtom(manipulationAtom);

  const setNarrowedRange = (index: number, items: JsonRowItem[]) => {
    const range = deriveNarrowdRange(index, items);
    if (!range) { return; }
    setManipulation(prev => {
      const next = _.cloneDeep(prev);
      next.narrowedRange = range;
      return next;
    });
  };
  const unsetNarrowdRange = () => {
    setManipulation(prev => {
      const next = _.cloneDeep(prev);
      next.narrowedRange = null;
      return next;
    });
  }

  return {
    manipulation,
    setManipulation,
    setNarrowedRange,
    unsetNarrowdRange,
  };
};
