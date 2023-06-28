import { JsonRowItem } from '@/libs/jetson';
import { atom, useAtom } from 'jotai';
import _ from 'lodash';
import { useFilteredItems, useJSON } from './json';

export type ToggleState = { [index: number]: boolean };

const toggleAtom = atom<ToggleState>({});

export function useToggleState() {
  const [toggleState, setToggleState] = useAtom(toggleAtom);
  const { flatJsons } = useJSON();
  const { filteredItems } = useFilteredItems();

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

  const openAll = () => {
    if (!filteredItems) { return; }
    if (filteredItems.length === flatJsons?.items.length) {
      setToggleState((prev) => {
        const next = _.cloneDeep(prev);
        for (const item of filteredItems) {
          delete next[item.index];
        }
        return next;
      });
    } else {
      setToggleState({});
    }
  };

  const closeAll = () => {
    if (!filteredItems) { return; }
    setToggleState((prev) => {
      const next = _.cloneDeep(prev);
      for (const item of filteredItems) {
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
