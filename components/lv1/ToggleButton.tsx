import React from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

export const ToggleButton = (
  props: {
    isClosed: boolean;
    onClick: (isClosed: boolean) => void;
  }
) => {
  return (
    <button
      className="flippable-button-secondary font-bold"
      onClick={() => props.onClick(!props.isClosed)}
    >
      {props.isClosed ? <BsChevronUp /> : <BsChevronDown />}
    </button>
  );
};
