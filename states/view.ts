import { JsonRowItem } from '@/libs/jetson';
import { atom, useAtom } from 'jotai';
import _ from 'lodash';

export type ToggleState = { [index: number]: boolean };

const toggleAtom = atom<ToggleState>({});

export function useToggleState() {
  const [toggleState, setToggleState] = useAtom(toggleAtom);

  const toggleItem = (item: JsonRowItem, isClosed: boolean) => {
    setToggleState((prev) => {
      const next = _.cloneDeep(prev);
      if (isClosed) {
        next[item.index] = isClosed;
      } else {
        delete next[item.index];
      }
      return next;
    });
  };

  const openAll = (
    range?: { from: number; to: number; },
  ) => {
    if (range) {
      setToggleState((prev) => {
        const next = _.cloneDeep(prev);
        _.range(range.from, range.to).forEach(i => delete next[i]);
        return next;
      });
    } else {
      setToggleState({});
    }
  };

  const closeAll = (
    items: JsonRowItem[],
    range?: { from: number; to: number; },
  ) => {
    setToggleState((prev) => {
      const next = _.cloneDeep(prev);
      const itemsInRange = range ? _.slice(items, range.from, range.to) : items;
      for (const item of itemsInRange) {
        if (item.rowItems.length === 0) { continue; }
        const isTogglable = item.right.type === "array" || item.right.type === "map";
        if (isTogglable) {
          next[item.index] = true;
        }
      }
      return next;
    });
  };

  const clearToggleState = () => openAll();

  return {
    toggleState,
    toggleItem,
    openAll,
    closeAll,
    clearToggleState,
  };
}
