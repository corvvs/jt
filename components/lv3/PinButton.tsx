import { VscPin, VscPinned } from "react-icons/vsc";
import { JsonRowItem } from "@/libs/jetson";
import { IconButton } from "../lv1/IconButton";
import { usePins } from "@/states/pins";
import { useDiffTarget } from "@/states/diff";

/**
 * 行のホバーメニューに出すピンのトグルボタン.
 * diff モードでは行の index 空間が別物になるためピンは扱わない.
 */
export const PinToggleButton = (props: {
  item: JsonRowItem;
}) => {
  const { diffTarget } = useDiffTarget();
  const { canPin, pinMap, togglePin } = usePins();
  if (diffTarget || !canPin) { return null; }
  const isPinned = pinMap.has(props.item.elementKey);
  return (<p>
    <IconButton
      icon={isPinned ? VscPinned : VscPin}
      alt={isPinned ? "この行のピンを外す" : "この行にピンを打つ"}
      onClick={() => togglePin(props.item)}
    />
  </p>);
};
