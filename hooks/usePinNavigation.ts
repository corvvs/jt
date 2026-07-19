import { useEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { useVisibleItems } from '@/states/json';
import { toggleAtom } from '@/states/view';
import { narrowedRangeAtom } from '@/states/manipulation/narrowing';
import { resolvedPinsAtom, pendingMemoAtom, pinJumpRequestAtom, ResolvedPin } from '@/states/pins';
import { popNarrowedRangesToInclude } from '@/libs/pins';

type PendingScroll = {
  /** ジャンプ先の行 index (全体 index) */
  index: number;
  keypath: string;
  /** スクロール成立後にメモバルーンを表示状態で開くか */
  openBalloon: boolean;
};

/**
 * ピンへのジャンプ.
 *
 * ピン行はフォールドされた部分木の中やナローイング範囲の外にありうるので,
 * ジャンプ時に (1) 祖先のフォールドを開き, (2) 対象を含む所までナローイングを
 * pop してから, 再計算後の表示行に対して scrollToItem する.
 * 状態更新から表示行の再計算までは非同期なので, スクロールは
 * pending 状態を介して effect で行う (useMatchNavigation と違い
 * ジャンプ先が現在の表示行に含まれている保証がないため).
 */
export const usePinNavigation = (itemViewRef: React.MutableRefObject<any>) => {
  const visibles = useVisibleItems();
  const resolvedPins = useAtomValue(resolvedPinsAtom);
  const setToggleState = useSetAtom(toggleAtom);
  const setNarrowedRanges = useSetAtom(narrowedRangeAtom);
  const setPendingMemo = useSetAtom(pendingMemoAtom);
  const [jumpRequest, setJumpRequest] = useAtom(pinJumpRequestAtom);
  const [pendingScroll, setPendingScroll] = useState<PendingScroll | null>(null);

  const jumpToPin = (resolved: ResolvedPin, options?: { openBalloon?: boolean }) => {
    const { item } = resolved;
    if (!item) { return; }

    // 祖先のフォールドを開く (行自身のフォールドは開閉どちらでも行は見える)
    setToggleState((prev) => {
      if (!item.rowItems.some((ancestor) => prev[ancestor.index])) { return prev; }
      const next = _.cloneDeep(prev);
      for (const ancestor of item.rowItems) {
        delete next[ancestor.index];
      }
      return next;
    });

    // ナローイング範囲の外なら, 対象を含む所まで pop する
    setNarrowedRanges((prev) => popNarrowedRangesToInclude(prev, item.index));

    setPendingScroll({
      index: item.index,
      keypath: resolved.pin.keypath,
      openBalloon: !!options?.openBalloon,
    });
  };

  // バルーン等からのジャンプ要求 (itemViewRef を持たない場所から発行される)
  useEffect(() => {
    if (!jumpRequest) { return; }
    setJumpRequest(null);
    const resolved = resolvedPins.find((r) => r.pin.keypath === jumpRequest.keypath);
    if (resolved?.item) {
      jumpToPin(resolved, { openBalloon: jumpRequest.openBalloon });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpRequest, resolvedPins]);

  useEffect(() => {
    if (pendingScroll === null || !visibles) { return; }
    setPendingScroll(null);
    const visibleIndex = visibles.visibleItems.findIndex((it) => it.index === pendingScroll.index);
    if (visibleIndex < 0) {
      // フォールドとナローイングは解除済みなので, 残る原因は検索による絞り込み
      toast("検索による絞り込みで隠れているため表示できません");
      return;
    }
    itemViewRef.current?.scrollToItem(visibleIndex, 'center');
    if (pendingScroll.openBalloon) {
      setPendingMemo({ keypath: pendingScroll.keypath, editing: false });
    }
  }, [pendingScroll, visibles, itemViewRef, setPendingMemo]);

  return {
    resolvedPins,
    jumpToPin,
  };
};

export type PinNavigation = ReturnType<typeof usePinNavigation>;
