import { atom, useAtom } from "jotai";

type Preference = {
  /**
   * サブツリーの統計情報を表示するかどうか
   */
  visible_subtree_stat: boolean;
};

const defaultPreference: Preference = {
  visible_subtree_stat: false,
};

const preferenceAtom = atom<Preference>(defaultPreference);

export const usePreference = () => {
  const [preference, setPreference] = useAtom(preferenceAtom);
  return {
    preference,
    setPreference,
  };
};
