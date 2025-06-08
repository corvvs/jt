import { JsonRowItem } from "@/libs/jetson";
import { IconButton } from "../lv1/IconButton";
import { VscCopy } from "react-icons/vsc";
import { ClipboardAccess } from "@/libs/sideeffect";
import { toast } from "react-toastify";

export const CopyButton = (props: {
  alt: string;
  getSubtext: () => string | null;
  getToastText: () => string;
}) => {
  return (<p>
    <IconButton
      icon={VscCopy}
      alt={props.alt}
      onClick={async () => {
        const subText = props.getSubtext();
        if (typeof subText !== "string") { return; }
        try {
          await ClipboardAccess.copyText(subText);
          toast(props.getToastText());
        } catch (e) {
          console.error(e);
        }
      }}
    />
  </p>);
}
