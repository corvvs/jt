import { atom } from "jotai";

/**
 * 右側パネル (Profile / Pins / ハイライトルール) の排他制御.
 *
 * パネルが増えて画面を占有しすぎないよう, 右側は同時に1枚しか開けない。
 * 各パネルの preference hook (useProfilePreference 等) はこの atom の derived view で,
 * 公開 API (xxxPreference.showPanel / setShowXxxPanel) は排他化前と変わらない。
 * 「閉じる」は自分がアクティブな時だけ効く (他のパネルを巻き添えにしない)。
 */
export type RightPanelKind = "profile" | "pins" | "highlight";

export const activeRightPanelAtom = atom<RightPanelKind | null>(null);
