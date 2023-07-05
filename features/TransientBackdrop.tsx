import { SyntheticEvent, useRef, useState } from "react";

export const useTransientBackdrop = () => {
  const hoveredRef = useRef<HTMLElement | null>(null);
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

  const handleMouseEnter = (e: SyntheticEvent<HTMLElement>) => {
    const animation = hoveredRef.current ? "move" : "in";
    hoveredRef.current = e.currentTarget as HTMLElement;
    const width = hoveredRef.current.offsetWidth;
    const left = hoveredRef.current.offsetLeft
    setHoverState({ left, width, animation, visible: true })
  };
  const handleMouseLeave = () => {
    hoveredRef.current = null;  // マウスが要素から離れたときはnullを設定
    setHoverState((prev) => {
      return { ...prev, animation: "out", visible: false };
    })
  };

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
    backdrop,
  };
};