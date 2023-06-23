import React from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export const ToggleButton = (
  props: {
    isClosed: boolean;
    onClick: (isClosed: boolean) => void;
  }
) => {
  return (
    <button
      className="font-bold"
      onClick={() => props.onClick(!props.isClosed)}
    >
      {props.isClosed ? <FaChevronUp /> : <FaChevronDown />}
    </button>
  );
};
