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

/**
 * ミニマップに描く「現在の表示範囲」(可視行 index の start/stop).
 * FixedSizeList の onItemsRendered が高頻度で更新するため, 購読は MinimapView だけに
 * 閉じておき, Main 本体やリストを再レンダーさせない.
 */
export type MinimapViewport = { startIndex: number; stopIndex: number };
export const minimapViewportAtom = atom<MinimapViewport | null>(null);
