import { useJSON } from "@/states";
import { VscJson } from 'react-icons/vsc';
import { InlineIcon } from "../lv1/InlineIcon";
import { JetButton } from "../lv1/JetButton";
import { BsIndent } from "react-icons/bs";
import { useToggleMass } from "@/states/view";
import { useManipulation } from "@/states/manipulation";
import { useState } from "react";

const OperationPanel = (props: {
  setErrorStr: (str: string) => void;
  closeModal: () => void;
}) => {
  const { rawText, setRawtext, setBaseText, parseJson, setParsedJson }  = useJSON();
  const { clearToggleState } = useToggleMass();
  const { clearManipulation } = useManipulation();

  const setErrorStr = (e: any) => {
    if (e instanceof Error) {
      props.setErrorStr(e.message);
    } else {
      props.setErrorStr("some error has occurred");
    }
  }

  return <>
    <div>
      <JetButton
        onClick={() => {
          setBaseText(rawText)
          try {
            const json = parseJson(rawText);
            // パース成功時
            setParsedJson({ json });
            clearManipulation();
            clearToggleState();
            props.closeModal()
          } catch (e) {
            setErrorStr(e);
          }
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
            setErrorStr(e);
          }
        }}
      >
        <InlineIcon i={<BsIndent />} />
        JSONを整形
      </JetButton>
    </div>

    <div>
      <JetButton
        onClick={() => {
          try {
            setRawtext(JSON.stringify(JSON.parse(rawText), null, 0))
          } catch (e) {
            setErrorStr(e);
          }
        }}
      >
        <InlineIcon i={<BsIndent />} />
        JSONをMinify
      </JetButton>
    </div>
  </>
};

const FooterBar = (props: {
  rawText: string;
  errorStr: string;
}) => {

  return <>
    {
      props.errorStr
        ? <p
            className="p-2 text-red-500"
          >
            {props.errorStr}
          </p>
        : null
    }

    <p
      className="p-2"
    >{ props.rawText.length } 文字</p>
  </>
};

export const EditJsonCard = (props: {
  closeModal: () => void;
}) => {
  const { rawText, setRawtext }  = useJSON();
  const [errorStr, setErrorStr] = useState("");

  return (
    <div
      className='json-text w-[48em] flex flex-col font-mono text-sm border-2 rounded-lg'
    >
      <div
        className="shrink-0 grow-0 flex flex-row gap-2 p-2 text-md"
      >
        <OperationPanel
          {...props}
          setErrorStr={setErrorStr}
        />
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

      <div
        className="shrink-0 grow-0 flex flex-row justify-end items-center gap-2 text-md"
      >
        <FooterBar rawText={rawText} errorStr={errorStr} />
      </div>
    </div>
  )
};
