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
        'flippable-button h-[2.4em] py-1 px-2' + (props.className || '')
      }
      style={{
        ...(props.style || {}),
      }}
    />
  );
};
