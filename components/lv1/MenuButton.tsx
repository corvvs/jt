import React, { ReactNode } from "react";

export const MenuButton = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  return (
    <button
      {...{ ...props }}
      className={
        'flippable-button h-[2.4em] py-1 px-2' + (props.className || '')
      }
      style={{
        ...(props.style || {}),
      }}
    />
  );
};

export const MenuToggleButton = (
  props: {
    isToggled: boolean;
    onClick: (isToggled: boolean) => void;
    children: ReactNode;
  }
) => {
  return (
    <button
      className={`menu-toggle-button h-[2em] py-1 px-2 ${ props.isToggled ? "is-toggled" : "is-not-toggled"}`}
      onClick={() => props.onClick(!props.isToggled)}
    >
      {props.children}
    </button>
  );
}
