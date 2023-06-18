import { atom, useAtom } from 'jotai';

export type ToggleState = { [index: number]: boolean };

const toggleAtom = atom<ToggleState>({});

export function useToggleState() {
  const [toggleState, setToggleState] = useAtom(toggleAtom);
  return {
    toggleState,
    setToggleState,
  };
}
