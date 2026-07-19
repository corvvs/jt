import { IconType } from "react-icons";

export const IconButton = (
  props: {
    icon: IconType;
    alt?: string;
    onClick?: () => void;
    onMouseDown?: (e: React.MouseEvent) => void;
  }
) => {
  const Icon = props.icon;
  return (
    <button
      className={
        'border-2 rounded-md p-1'
      }
      onClick={props.onClick}
      onMouseDown={props.onMouseDown}
      title={props.alt}
    >
      <Icon />
    </button>
  );
};
