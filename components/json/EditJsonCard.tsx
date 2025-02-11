import { useJSON } from "@/states";
import { InlineIcon } from "../lv1/InlineIcon";
import { JetButton } from "../lv1/JetButton";
import { BsIndent } from "react-icons/bs";
import { useToggleMass } from "@/states/view";
import { useManipulation } from "@/states/manipulation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { JsonDocumentStore } from "@/data/document";
import { FaSortAlphaDown } from "react-icons/fa";
import { sortKeysJson } from "@/libs/tree_manipulation";
import { TiArrowMinimise } from "react-icons/ti";
import { MdContentPasteGo, MdOutlineDeleteOutline } from "react-icons/md";
import { ClipboardAccess } from "@/libs/sideeffect";

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

  const parseAndClose = async (title: string, text: string) => {
    const json = parseJson(text);
    setParsedJson({ status: "accepted", json, text });
    setDocumentData(title, text);

    clearManipulation();
    clearToggleState();
    const id = await JsonDocumentStore.saveDocument({
      ...document,
      name: title,
      json_string: text,
    });
    const [docId] = (router.query.docId || []) as string[];
    if (id !== docId) {
      router.replace(`/${id}`);
    }

    props.closeModal();
  };

  return <>
    <div>
      <JetButton
        onClick={async () => {
          try {
            const shapedText = JSON.stringify(JSON.parse(props.rawText), null, 2);
            props.setRawText(shapedText)
            await parseAndClose(props.title, shapedText);
          } catch (e) {
            setErrorStr(e);
          }
        }}
      >
        <InlineIcon i={<BsIndent />} />
        変換
      </JetButton>
    </div>

    <div>
      <JetButton
        onClick={async () => {
          try {
            const sortedText = sortKeysJson(props.rawText);
            const shapedText = JSON.stringify(JSON.parse(sortedText), null, 2);
            props.setRawText(shapedText);
            await parseAndClose(props.title, shapedText);
          } catch (e) {
            console.error(e);
            setErrorStr(e);
          }
        }}
      >
        <InlineIcon i={<FaSortAlphaDown />} />
        Mapをキーでソートして変換
      </JetButton>
    </div>
  </>
};

const EditorPanel = (props: {
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

  const parseAndClose = async (title: string, text: string) => {
    const json = parseJson(text);
    setParsedJson({ status: "accepted", json, text });
    setDocumentData(title, text);

    clearManipulation();
    clearToggleState();
    const id = await JsonDocumentStore.saveDocument({
      ...document,
      name: title,
      json_string: text,
    });
    const [docId] = (router.query.docId || []) as string[];
    if (id !== docId) {
      router.replace(`/${id}`);
    }

    props.closeModal();
  };

  return <>
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
        <InlineIcon i={<TiArrowMinimise />} />
        Minify
      </JetButton>
    </div>

    <div>
      <JetButton
        onClick={async () => {
          try {
            props.setRawText(await ClipboardAccess.pasteText())
          } catch (e) {
            setErrorStr(e);
          }
        }}
      >
        <InlineIcon i={<MdContentPasteGo />} />
        From Clipboard
      </JetButton>
    </div>

    <div>
      <JetButton
        onClick={() => props.setRawText("")}
      >
        <InlineIcon i={<MdOutlineDeleteOutline />} />
        Del
      </JetButton>
    </div>

  </>
};

const FooterBar = (props: {
  rawText: string;
  errorStr: string;
  isTooLargeToEdit: boolean;
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
      className={props.isTooLargeToEdit ? "p-2 text-red-500 break-keep whitespace-nowrap" : "p-2 break-keep whitespace-nowrap"}
    >{props.isTooLargeToEdit ? "(直接編集不可)" : ""}{props.rawText.length} 文字</p>
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
  const isTooLargeToEdit = rawText.length > 10 * 1024;

  useEffect(() => {
    inputRef.current.value = title;
    textareaRef.current?.focus();
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
        className="shrink-0 grow-0 flex flex-row gap-2 p-2 text-md"
      >
        <EditorPanel
          {...props}
          rawText={rawText}
          title={title}
          setRawText={setRawText}
          setErrorStr={setErrorStr}
        />
      </div>

      <div
        className="shrink grow relative p-2"
      >
        {isTooLargeToEdit
          ? <div
              className="w-full h-[24em] outline-none p-1 json-text-ineditable overflow-hidden"
              style={{ resize: "none" }}
            >
              {rawText.substring(0, 10 * 1024)}
            </div>
          : <textarea
              ref={textareaRef}
              className="w-full h-[24em] outline-none border-[1px] p-1 json-text-textarea"
              style={{ resize: "none" }}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
        }
      </div>

      <div
        className="shrink-0 grow-0 flex flex-row justify-end items-center gap-2 text-md"
      >
        <FooterBar rawText={rawText} errorStr={errorStr} isTooLargeToEdit={isTooLargeToEdit} />
      </div>
    </div>
  )
};
