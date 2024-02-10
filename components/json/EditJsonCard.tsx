import { useJSON } from "@/states";
import { VscJson } from 'react-icons/vsc';
import { InlineIcon } from "../lv1/InlineIcon";
import { JetButton } from "../lv1/JetButton";
import { BsIndent } from "react-icons/bs";
import { useToggleMass } from "@/states/view";
import { useManipulation } from "@/states/manipulation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { JsonDocumentStore } from "@/data/document";

const OperationPanel = (props: {
  rawText: string;
  setRawText: (next: string) => void;
  title: string;
  setErrorStr: (str: string) => void;
  closeModal: () => void;
}) => {
  const { document, setDocumentData, parseJson, setParsedJson } = useJSON();
  const { clearToggleState } = useToggleMass();
  const { clearManipulation } = useManipulation();
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
            setDocumentData(props.title, props.rawText);

            clearManipulation();
            clearToggleState();
            const id = await JsonDocumentStore.saveDocument({
              ...document,
              name: props.title,
              json_string: props.rawText,
            });
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
    >{props.rawText.length} 文字</p>
  </>
};

export const EditJsonCard = (props: {
  closeModal: () => void;
}) => {
  const { document, baseText } = useJSON();
  const [title, setTitle] = useState(document?.name || "");
  const [rawText, setRawText] = useState(baseText);
  const [errorStr, setErrorStr] = useState("");
  const inputRef = useRef<any>();
  const textareaRef = useRef<any>();

  useEffect(() => {
    inputRef.current.value = title;
    textareaRef.current.focus();
  }, []);

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
          title={title}
          setRawText={setRawText}
          setErrorStr={setErrorStr}
        />
      </div>

      <div
        className="shrink-0 grow-0 relative p-2"
      >
        <input
          type="text"
          ref={inputRef}
          className="p-2 bg-transparent	border-[1px] outline-0 w-full"
          placeholder="タイトルを入力"
          onChange={(e) => {
            setTitle(e.currentTarget.value);
          }}
        />
      </div>

      <div
        className="shrink grow relative p-2"
      >
        <h3
          className="text-lg"
        >本文</h3>
        <textarea
          ref={textareaRef}
          className="w-full h-[24em] outline-none json-text-textarea"
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
