import { atom, useAtom } from "jotai";

export type MinimapPreference = {
  showPanel: boolean;
};

// ミニマップは細い帯なので既定で表示する (Profile/Pins パネルは既定 false だがここは true)
const minimapPreferenceAtom = atom<MinimapPreference>({ showPanel: true });

export const useMinimapPreference = () => {
  const [minimapPreference, setMinimapPreference] = useAtom(minimapPreferenceAtom);
  return {
    minimapPreference,
    setShowMinimap: (value: boolean) => setMinimapPreference((prev) => ({ ...prev, showPanel: value })),
  } as const;
};
