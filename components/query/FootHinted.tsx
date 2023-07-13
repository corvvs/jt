import { ReactNode } from "react";

export const FootHinted = (props: {
  hint?: string;
  children: ReactNode;
}) => {
  return <div
    className="flex flex-col items-end"
  >
    <div>{props.children}</div>

    <div
      className="hint-footer"
    >
      { props.hint || "" }
    </div>
  </div>;
};
