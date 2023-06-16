import { useJSON } from "@/states";
import { VscJson } from 'react-icons/vsc';
import { InlineIcon } from "../lv1/InlineIcon";
import { JetButton } from "../lv1/JetButton";
import { BsIndent } from "react-icons/bs";

export const EditJsonCard = (props: {
  closeModal: () => void;
}) => {
  const { rawText, setRawtext, setBaseText, flatJsons }  = useJSON();
  return (
    <div
      className='json-text w-[36em] flex flex-col font-mono text-sm border-2 rounded-lg'
    >
      <div
        className="shrink-0 grow-0 flex flex-row gap-2 p-2 text-md"
      >
        <div>
          <JetButton
            onClick={() => {
              setBaseText(rawText)
              props.closeModal()
            }}
          >
            <InlineIcon i={<VscJson />} />
            変換
          </JetButton>
        </div>

        <div>
          <JetButton
            onClick={() => {
              try {
                setRawtext(JSON.stringify(JSON.parse(rawText), null, 2))
              } catch (e) {
                console.log(e)
              }
            }}
          >
            <InlineIcon i={<BsIndent />} />
            整形
          </JetButton>
        </div>

      </div>
      <div
        className="shrink grow relative"
      >
        <textarea
          className="w-full h-[24em] outline-none p-2 json-text-textarea"
          style={{ resize: "none" }}
          value={rawText}
          onChange={(e) => setRawtext(e.target.value)}
        />
      </div>
    </div>
  )
};