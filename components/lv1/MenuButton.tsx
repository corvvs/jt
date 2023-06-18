import React from "react";

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
        'menu-button h-[3em] border-x-[1px] py-1 px-2' + (props.className || '')
      }
      style={{
        ...(props.style || {}),
      }}
    />
  );
};
