import { atom, useAtom } from "jotai";
import _ from "lodash";
import { ProfileNode, profileJson } from "@/libs/profile";
import { effectiveItemsAtom } from "./json";
import { diffTargetAtom } from "./diff";
import { narrowedRangeAtom } from "./manipulation/narrowing";

export type ProfilePreference = {
  showPanel: boolean;
};

const profilePreferenceAtom = atom<ProfilePreference>({ showPanel: false });

export const useProfilePreference = () => {
  const [profilePreference, setProfilePreference] = useAtom(profilePreferenceAtom);
  return {
    profilePreference,
    setShowProfilePanel: (value: boolean) => setProfilePreference((prev) => ({ ...prev, showPanel: value })),
  } as const;
};

export type ProfileResult = {
  /**
   * プロファイル対象サブツリーのキーパス. ドキュメント全体なら ""
   */
  rootKey: string;
  profile: ProfileNode;
};

/**
 * 表示中ドキュメント (ナローイング中はそのサブツリー) のプロファイル.
 * derived atom なので, パネルが購読しているときだけ計算される.
 * diff モードでは行アイテムが新旧のマージ列になり対象が曖昧なため null.
 */
export const profileAtom = atom((get): ProfileResult | null => {
  try {
    if (get(diffTargetAtom)) { return null; }
    const flatJsons = get(effectiveItemsAtom);
    if (!flatJsons || flatJsons.items.length === 0) { return null; }
    const range = _.last(get(narrowedRangeAtom));
    const rootItem = range ? flatJsons.items[range.from] : flatJsons.items[0];
    if (!rootItem) { return null; }
    return {
      rootKey: rootItem.elementKey,
      profile: profileJson(rootItem.right, rootItem.elementKey),
    };
  } catch (e) {
    console.error(e);
    return null;
  }
});

export const useProfile = () => {
  const [profile] = useAtom(profileAtom);
  return profile;
};
