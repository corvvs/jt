import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

type BackdropAxis = "x" | "y";

type TransientBackdropOptions = {
  /**
   * バックドロップが動く向き.
   * 横並びのツールバーは "x" (既定), 縦並びのメニューは "y".
   */
  axis?: BackdropAxis;
  /**
   * hover していないときにバックドロップが載る要素.
   * 渡すと「消える」のではなくこの要素へ戻るので, 選択状態の表示を兼ねられる.
   * null なら従来どおり hover が外れたら消える.
   */
  restingElement?: HTMLElement | null;
};

export const useTransientBackdrop = (options?: TransientBackdropOptions) => {
  const axis = options?.axis ?? "x";
  const restingElement = options?.restingElement ?? null;

  const hoveredRef = useRef<HTMLElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoverState, setHoverState] = useState<{
    /** 軸に沿った位置 */
    offset: number;
    /** 軸に沿った長さ */
    size: number;
    visible: boolean;
    animation: "in" | "out" | "move" | "instant"
  }>({
    offset: 0,
    size: 0,
    visible: false,
    animation: "in",
  });

  // 軸に沿った位置と長さを測る. 横は offsetLeft/offsetWidth, 縦は offsetTop/offsetHeight.
  const measure = (el: HTMLElement) => (
    axis === "y"
      ? { offset: el.offsetTop, size: el.offsetHeight }
      : { offset: el.offsetLeft, size: el.offsetWidth }
  );

  const cancelHide = () => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const hide = () => {
    hoveredRef.current = null;  // マウスが要素から離れたときはnullを設定
    setHoverState((prev) => {
      // 定位置があるなら消さずにそこへ戻す
      if (restingElement) {
        return { ...measure(restingElement), visible: true, animation: "move" };
      }
      return { ...prev, animation: "out", visible: false };
    });
  };

  const handleMouseEnter = (e: SyntheticEvent<HTMLElement>) => {
    cancelHide();
    const el = e.currentTarget as HTMLElement;
    hoveredRef.current = el;
    // 既に出ているならスライド, 出ていないならフェードイン
    setHoverState((prev) => ({
      ...measure(el),
      visible: true,
      animation: prev.visible ? "move" : "in",
    }));
  };

  const handleMouseLeave = () => {
    cancelHide();
    hide();
  };

  // 無効ボタン (pointer-events: none で hover がコンテナへ透過する) や
  // ボタン間の余白の上に来たら backdrop を消す.
  // ただし消去を少し遅らせ, 直後に有効ボタンへ入る (handleMouseEnter) とキャンセルする:
  // - 隣接する有効ボタン間の gap を一瞬跨ぐだけならスライドが維持される
  // - 無効ボタンの上で止まると, キャンセルされず消える
  const handleContainerMouseOver = (e: SyntheticEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) { return; }
    cancelHide();
    hideTimerRef.current = setTimeout(hide, 80);
  };

  // 定位置の出入りに追従する.
  // ペイント前に走らせる: useEffect だと定位置が決まるのが1フレーム遅れ,
  // 「メニューが出てから一拍おいて選択行がライトアップされる」ように見える.
  useIsomorphicLayoutEffect(() => {
    if (!restingElement) {
      // 定位置が消えた (メニューを閉じた等). 次に開くときスライドしないよう畳んでおく
      setHoverState((prev) => (prev.visible ? { ...prev, visible: false, animation: "out" } : prev));
      return;
    }
    if (hoveredRef.current) { return; }
    setHoverState((prev) => ({
      ...measure(restingElement),
      visible: true,
      // 初回配置はメニュー自体が現れる瞬間なので, フェードさせず即座に置く.
      // 2回目以降 (hover から戻ってきた等) はスライドさせる.
      animation: prev.visible ? "move" : "instant",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restingElement, axis]);

  useEffect(() => cancelHide, []);

  const backdrop = <div
    className={`transient-backdrop${axis === "y" ? " is-vertical" : ""}`}
    style={{
      ...(
        axis === "y"
          ? { height: hoverState.size, transform: `translateY(${hoverState.offset}px)` }
          : { width: hoverState.size, transform: `translateX(${hoverState.offset}px)` }
      ),
      opacity: hoverState.visible ? 1 : 0,
      ...(
        hoverState.animation === "move"
          ? { transitionDuration: "128ms" }
          : hoverState.animation === "instant"
            ? { transition: "none" }
            : { transition: "opacity 128ms" }
      ),
    }}
  />;

  return {
    handleMouseEnter,
    handleMouseLeave,
    handleContainerMouseOver,
    backdrop,
  };
};
