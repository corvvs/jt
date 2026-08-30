import React, { ReactNode } from "react";

export const MenuButton = (
  props: {
    onClick: () => void;
    onMouseEnter?: React.MouseEventHandler<HTMLElement> | undefined;
    children: ReactNode;
    disabled?: boolean;
    className?: string;
    /**
     * アイコンのみのボタンでラベルを補うための説明.
     * title は hover 時のツールチップ, ariaLabel は支援技術向けの名前になる.
     */
    title?: string;
    ariaLabel?: string;
  }
) => {
  return (
    <button
      className={
        `flippable h-[2.4em] py-1 whitespace-nowrap break-keep ${props.className ?? ""}`
      }
      onClick={() => props.onClick()}
      onMouseEnter={props.onMouseEnter}
      disabled={props.disabled}
      title={props.title}
      aria-label={props.ariaLabel ?? props.title}
    >
      {props.children}
    </button>
  );
};

export const MenuToggleButton = (
  props: {
    isToggled: boolean;
    onClick: (isToggled: boolean) => void;
    onMouseEnter?: React.MouseEventHandler<HTMLElement> | undefined;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
    title?: string;
    ariaLabel?: string;
  }
) => {
  return (
    <button
      className={`menu-toggle-button h-[2.4em] py-1 whitespace-nowrap break-keep ${ props.isToggled ? "is-toggled" : "is-not-toggled"} ${props.className ?? ""}`}
      onClick={() => props.onClick(!props.isToggled)}
      onMouseEnter={props.onMouseEnter}
      disabled={props.disabled}
      title={props.title}
      aria-label={props.ariaLabel ?? props.title}
      aria-pressed={props.isToggled}
    >
      {props.children}
    </button>
  );
}
