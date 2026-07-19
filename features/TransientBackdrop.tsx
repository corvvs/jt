import { SyntheticEvent, useEffect, useRef, useState } from "react";

export const useTransientBackdrop = () => {
  const hoveredRef = useRef<HTMLElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoverState, setHoverState] = useState<{
    left: number;
    width: number;
    visible: boolean;
    animation: "in" | "out" | "move"
  }>({
    left: 0,
    width: 0,
    visible: false,
    animation: "in",
  });

  const cancelHide = () => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const hide = () => {
    hoveredRef.current = null;  // マウスが要素から離れたときはnullを設定
    setHoverState((prev) => {
      return { ...prev, animation: "out", visible: false };
    });
  };

  const handleMouseEnter = (e: SyntheticEvent<HTMLElement>) => {
    cancelHide();
    const animation = hoveredRef.current ? "move" : "in";
    hoveredRef.current = e.currentTarget as HTMLElement;
    const width = hoveredRef.current.offsetWidth;
    const left = hoveredRef.current.offsetLeft
    setHoverState({ left, width, animation, visible: true })
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

  useEffect(() => cancelHide, []);

  const backdrop = <div
    className="transient-backdrop"
    style={{
      width: hoverState.width,
      transform: `translateX(${hoverState.left}px)`,
      opacity: hoverState.visible ? 1 : 0,
      ...(
        hoverState.animation === "move"
          ? { transitionDuration: "128ms" }
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
