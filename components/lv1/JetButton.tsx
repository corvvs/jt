import React from "react";

export const JetButton = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  return (
    <button
      {...{ ...props }}
      className={
        'flippable h-[3em] border-[1px] py-1 px-2' + (props.className || '')
      }
      style={{
        ...(props.style || {}),
      }}
    />
  );
};
