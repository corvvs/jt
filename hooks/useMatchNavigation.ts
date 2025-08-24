import { useCallback, useEffect, useState } from 'react';
import { useManipulation } from '@/states/manipulation';
import { useVisibleItems } from '@/states/json';

export const useMatchNavigation = (itemViewRef: React.MutableRefObject<any>) => {
  const { filterMaps } = useManipulation();
  const visibles = useVisibleItems();
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  // マッチした行のインデックスを取得
  const matchedVisibleIndices = useCallback(() => {
    if (!filterMaps || !visibles) return [];
    
    return visibles.visibleItems
      .map((item, visibleIndex) => ({ item, visibleIndex }))
      .filter(({ item }) => filterMaps.matched[item.index])
      .map(({ visibleIndex }) => visibleIndex);
  }, [filterMaps, visibles]);

  // 次のマッチした行に移動
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

  // 前のマッチした行に移動
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

  // 最初のマッチした行に移動
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
  }, [filterMaps]);

  return {
    goToNextMatch,
    goToPreviousMatch,
    goToFirstMatch,
    matchedCount: matchedVisibleIndices().length,
    currentMatchIndex: currentMatchIndex + 1, // 1-based for UI
  };
};
