import { useJSON } from "@/states";
import { VscJson } from 'react-icons/vsc';
import { InlineIcon } from "../lv1/InlineIcon";
import { JetButton } from "../lv1/JetButton";
import { BsIndent } from "react-icons/bs";
import { useToggleMass } from "@/states/view";
import { useManipulation } from "@/states/manipulation";
import { useState } from "react";
import { useRouter } from "next/router";
import { useJsonDocument } from "@/data/document";

const OperationPanel = (props: {
  rawText: string;
  setRawText: (next: string) => void;
  setErrorStr: (str: string) => void;
  closeModal: () => void;
}) => {
  const { document, setBaseText, parseJson, setParsedJson }  = useJSON();
  const { clearToggleState } = useToggleMass();
  const { clearManipulation } = useManipulation();
  const { saveDocument } = useJsonDocument();
  const router = useRouter();

  if (!document) {
    return null;
  }

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
        onClick={async () => {
          try {
            const json = parseJson(props.rawText);
            // パース成功時
            setParsedJson({ status: "accepted", json, text: props.rawText });
            setBaseText(props.rawText);

            clearManipulation();
            clearToggleState();
            const id = await saveDocument({ ...document, json_string: props.rawText });
            const [docId] = (router.query.docId || []) as string[];
            if (id !== docId) {
              router.replace(`/${id}`);
            }

            props.closeModal();
          } catch (e) {
            console.error(e);
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
            props.setRawText(JSON.stringify(JSON.parse(props.rawText), null, 2))
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
            props.setRawText(JSON.stringify(JSON.parse(props.rawText), null, 0))
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
  const { baseText }  = useJSON();
  const [rawText, setRawText] = useState(baseText);
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
          rawText={rawText}
          setRawText={setRawText}
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
          onChange={(e) => setRawText(e.target.value)}
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
