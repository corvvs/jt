import { JsonRowItem } from "@/libs/jetson";
import { IconButton } from "../lv1/IconButton";
import { VscCopy, VscCloudDownload } from "react-icons/vsc";
import { ClipboardAccess, FileDownload } from "@/libs/sideeffect";
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

export const DownloadButton = (props: {
  alt: string;
  getData: () => any;
  getToastText: () => string;
  filename?: string;
}) => {
  return (<p>
    <IconButton
      icon={VscCloudDownload}
      alt={props.alt}
      onClick={() => {
        const data = props.getData();
        if (data == null) { return; }
        try {
          FileDownload.downloadAsJson(data, props.filename || 'data.json');
          toast(props.getToastText());
        } catch (e) {
          console.error(e);
        }
      }}
    />
  </p>);
}
