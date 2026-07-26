import { atom, useAtom } from "jotai";

/**
 * 開いているキーメニューの位置.
 *
 * 同じノードは配下の全行の祖先セルにも現れるので, 行とノードの両方で同定する
 * (ノードだけで持つと, 同じ祖先を表示している他の行にもメニューが開いてしまう)。
 */
export type KeyMenuTarget = {
  /** メニューを開いた行 (JsonRowItem.index) */
  rowIndex: number;
  /** メニューの対象ノード (JsonRowItem.index). 祖先セルでは行と異なる */
  nodeIndex: number;
};

const keyMenuAtom = atom<KeyMenuTarget | null>(null);

/**
 * キーメニューの開閉. ホバー状態に依らず開いたままにできるよう, 行のローカル state
 * ではなく atom で持つ (ピンのメモバルーンと同じ方針)。
 */
export const useKeyMenu = () => {
  const [keyMenu, setKeyMenu] = useAtom(keyMenuAtom);

  const isKeyMenuOpen = (rowIndex: number, nodeIndex: number) =>
    !!keyMenu && keyMenu.rowIndex === rowIndex && keyMenu.nodeIndex === nodeIndex;

  return {
    keyMenu,
    isKeyMenuOpen,
    /** 同じセルをもう一度押したら閉じる */
    toggleKeyMenu: (rowIndex: number, nodeIndex: number) => setKeyMenu(
      (prev) => (prev && prev.rowIndex === rowIndex && prev.nodeIndex === nodeIndex)
        ? null
        : { rowIndex, nodeIndex }
    ),
    closeKeyMenu: () => setKeyMenu(null),
  } as const;
};
