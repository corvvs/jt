import { JsonRowItem } from "@/libs/jetson";
import _ from "lodash";

export const LineNumberCell = (props: {
  item: JsonRowItem;
}) => {
  const lineNumber = props.item.lineNumber;

  return <div
    className={
      'w-[4em] grow-0 shrink-0 flex flex-row justify-end items-center p-1 line-number text-sm line-number-cell'
    }
  >
    <div>{lineNumber}</div>
  </div>
}
