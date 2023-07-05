import { useTransientBackdrop } from "@/features/TransientBackdrop";
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
  const {
    handleMouseEnter,
    handleMouseLeave,
    backdrop,
  } = useTransientBackdrop();



  const buttons = items.map(item => {
    const isActive = currentKey === item.key;
    return <button
      key={item.key}
      className={`multiple-buttons-button ${isActive ? "active" : ""}`}
      title={item.hint}
      onClick={() => onClick(item)}
      onMouseEnter={handleMouseEnter}
    >
      {item.content ? item.content : item.title || null}
    </button>
  });

  return <div
    className="multiple-buttons relative"
    onMouseLeave={handleMouseLeave}
  >
    { backdrop }
    { buttons }
  </div>;
}

