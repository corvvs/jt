import { useJSON } from "@/states";
import { VscJson } from 'react-icons/vsc';
import { InlineIcon } from "./lv1/InlineIcon";
import { JetButton } from "./lv1/JetButton";

export const JsonText = () => {
  const { rawText, setRawtext, setBaseText }  = useJSON();
  return (
    <div className='json-text shrink grow flex flex-col font-mono text-sm overflow-hidden'>
      <div className="shrink-0 grow-0 flex flex-row gap-2 p-2 text-md">
        <div>
          <JetButton
            onClick={() => setBaseText(rawText)}
          >
            <InlineIcon i={<VscJson />} />
            変換
          </JetButton>
        </div>
      </div>
      <div className="shrink grow">
        <textarea
          className="w-full h-full outline-none p-2 json-text-textarea"
          style={{ resize: "none" }}
          value={rawText}
          onChange={(e) => setRawtext(e.target.value)}
        />
      </div>
    </div>
  )
};
