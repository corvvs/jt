import { SyntheticEvent, useRef, useState } from "react";

type MultipleButtonItem<T> = {
  key: T;
  hint?: string;
  title?: string;
  content?: JSX.Element;
};

type MultipleButtonProps<T> = {
  items: MultipleButtonItem<T>[];
  currentKey?: T;
  onClick: (item: MultipleButtonItem<T>) => void;
};

export function MultipleButtons<T extends string>({
  items,
  currentKey,
  onClick,
}: MultipleButtonProps<T>) {
  const hoveredRef = useRef<HTMLElement | null>(null);
  const [hoverState, setHoverState] = useState<{
    key: any,
    left: number;
    width: number;
    visible: boolean;
    animation: "in" | "out" | "move"
  }>({
    key: null,
    left: 0,
    width: 0,
    visible: false,
    animation: "in",
  });

  const handleMouseEnter = (key: any, e: SyntheticEvent<HTMLElement>) => {
    const animation = hoveredRef.current ? "move" : "in";
    hoveredRef.current = e.currentTarget as HTMLElement;
    const width = hoveredRef.current.offsetWidth;
    const left = hoveredRef.current.offsetLeft
    setHoverState({ key, left, width, animation, visible: true })
  };
  const handleMouseLeave = () => {
    hoveredRef.current = null;  // マウスが要素から離れたときはnullを設定
    setHoverState((prev) => {
      return { ...prev, key: null, animation: "out", visible: false };
    })
  };

  const buttons = items.map(item => {
    const isActive = currentKey === item.key;
    return <button
      key={item.key}
      className={`multiple-buttons-button ${isActive ? "active" : ""}`}
      title={item.hint}
      onClick={() => onClick(item)}
      onMouseEnter={e => handleMouseEnter(item.key, e)}
    >
      {item.content ? item.content : item.title || null}
    </button>
  });

  console.log("hoverState", hoverState);
  return <div
    className="multiple-buttons relative"
    onMouseLeave={e => handleMouseLeave()}
  >
    <div
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
    />
    { buttons }
  </div>;
}

