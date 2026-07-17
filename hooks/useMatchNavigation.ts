import { useCallback, useEffect, useMemo, useState } from 'react';
import { useManipulation } from '@/states/manipulation';
import { useVisibleItems } from '@/states/json';
import { JsonRowItem } from '@/libs/jetson';

/**
 * 表示中の行のうち「対象行」の間を巡回するナビゲーション.
 * isTargetItem を省略した場合は検索クエリのマッチ行を対象にする.
 */
export const useMatchNavigation = (
  itemViewRef: React.MutableRefObject<any>,
  isTargetItem?: (item: JsonRowItem) => boolean,
) => {
  const { filterMaps } = useManipulation();
  const visibles = useVisibleItems();
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  // 対象行のインデックスを取得
  const matchedVisibleIndices = useCallback(() => {
    if (!visibles) return [];
    if (!isTargetItem && !filterMaps) return [];
    const predicate = isTargetItem
      ?? ((item: JsonRowItem) => !!filterMaps!.matched[item.index]);

    return visibles.visibleItems
      .map((item, visibleIndex) => ({ item, visibleIndex }))
      .filter(({ item }) => predicate(item))
      .map(({ visibleIndex }) => visibleIndex);
  }, [filterMaps, visibles, isTargetItem]);

  // 次の対象行に移動
  const goToNextMatch = useCallback(() => {
    const matchedIndices = matchedVisibleIndices();
    if (matchedIndices.length === 0) return;

    const nextIndex = currentMatchIndex < matchedIndices.length - 1
      ? currentMatchIndex + 1
      : 0; // 最後の場合は最初に戻る

    const targetVisibleIndex = matchedIndices[nextIndex];
    setCurrentMatchIndex(nextIndex);

    if (itemViewRef.current) {
      itemViewRef.current.scrollToItem(targetVisibleIndex, 'center');
    }
  }, [currentMatchIndex, matchedVisibleIndices, itemViewRef]);

  // 前の対象行に移動
  const goToPreviousMatch = useCallback(() => {
    const matchedIndices = matchedVisibleIndices();
    if (matchedIndices.length === 0) return;

    const prevIndex = currentMatchIndex > 0
      ? currentMatchIndex - 1
      : matchedIndices.length - 1; // 最初の場合は最後に移動

    const targetVisibleIndex = matchedIndices[prevIndex];
    setCurrentMatchIndex(prevIndex);

    if (itemViewRef.current) {
      itemViewRef.current.scrollToItem(targetVisibleIndex, 'center');
    }
  }, [currentMatchIndex, matchedVisibleIndices, itemViewRef]);

  // 最初の対象行に移動
  const goToFirstMatch = useCallback(() => {
    const matchedIndices = matchedVisibleIndices();
    if (matchedIndices.length === 0) return;

    const targetVisibleIndex = matchedIndices[0];
    setCurrentMatchIndex(0);

    if (itemViewRef.current) {
      itemViewRef.current.scrollToItem(targetVisibleIndex, 'center');
    }
  }, [matchedVisibleIndices, itemViewRef]);

  // フィルターが変更されたら現在のインデックスをリセット
  useEffect(() => {
    setCurrentMatchIndex(-1);
  }, [filterMaps, isTargetItem]);

  // 対象行の走査は全表示行に対する O(N) なので, 入力が変わった時だけ数え直す
  const matchedCount = useMemo(() => matchedVisibleIndices().length, [matchedVisibleIndices]);

  return {
    goToNextMatch,
    goToPreviousMatch,
    goToFirstMatch,
    matchedCount,
    currentMatchIndex: currentMatchIndex + 1, // 1-based for UI
  };
};

export type MatchNavigation = ReturnType<typeof useMatchNavigation>;
