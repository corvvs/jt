import { atom, useAtom } from "jotai";

type Manipulation = {
  selectedIndex: number | null;
};

const defaultManipulation: Manipulation = {
  selectedIndex: null,
};

const manipulationAtom = atom<Manipulation>(defaultManipulation);

export const useManipulation = () => {
  const [manipulation, setManipulation] = useAtom(manipulationAtom);
  return {
    manipulation,
    setManipulation,
  };
};
