import { useJSON } from "@/states";
import { FlatJsonRow } from "./json/FlatJsonRow";
import { FixedSizeList } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import _ from "lodash";
import { FooterBar } from "./lv3/FooterBar";
import { MutableRefObject, useEffect, useRef } from "react";
import { FaRegFrown, FaRegMehRollingEyes } from 'react-icons/fa';
import { defaultRawText, useVisibleItems } from "@/states/json";
import { HeaderBar } from "./lv3/HeaderBar";
import { useManipulation } from "@/states/manipulation";
import { QueryView } from "./query/QueryView";
import { useEditJsonModal } from "@/states/modal";
import { useToggleSingle } from "@/states/view";
import { useRouter } from "next/router";
import { JsonPartialDocument, JsonDocumentStore } from "@/data/document";
import { ClipboardAccess } from "@/libs/sideeffect";
import { toast } from "react-toastify";
import { sortKeysJson } from "@/libs/tree_manipulation";
import { useDataFormat } from "@/states/config";

interface VirtualScrollProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  itemSize: number;
  itemViewRef: MutableRefObject<any>;
}

function VirtualScroll<T>({ data, renderItem, itemSize, itemViewRef }: VirtualScrollProps<T>) {
  const Row = ({ index, style }: any) => {
    return (
      <div style={style}>
        {renderItem(data[index], index)}
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }: { height: number; width: number; }) => (
        <FixedSizeList
          ref={itemViewRef}
          height={height}
          width={width}
          itemCount={data.length}
          itemSize={itemSize}
          overscanCount={20}
        >
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
}

const JsonItemsView = (props: {
  itemViewRef: MutableRefObject<any>;
}) => {
  const { json } = useJSON();
  const visibles = useVisibleItems();
  const { openModal } = useEditJsonModal();
  const manipulationHook = useManipulation();
  const toggleSingleHook = useToggleSingle();

  if (!json) {
    return null;
  }

  if (json.status !== "accepted") {
    return <div
      className="h-full shrink grow gap-2 flex flex-col justify-center items-center cursor-pointer"
      onClick={() => openModal()}
    >
      <FaRegFrown className="text-4xl" />
      <p className="text-xl">I have an Invalid Data.</p>
    </div>
  }

  if (!visibles) {
    return <div
      className="h-full shrink grow gap-2 flex flex-col justify-center items-center"
    >
      <FaRegMehRollingEyes className="text-4xl" />
      <p className="text-xl">No Visible Items.</p>
    </div>
  }

  const { visibleItems, gauge } = visibles;
  return (
    <VirtualScroll
      itemViewRef={props.itemViewRef}
      data={visibleItems} // データ
      renderItem={(item) => <FlatJsonRow
        key={item.elementKey}
        item={item}
        manipulationHook={manipulationHook}
        toggleSingleHook={toggleSingleHook}
        gauge={gauge}
      />
      }
      itemSize={32} // 各アイテムの高さ
    />
  );
}

export const Main = (props: {
  docId?: string;
}) => {
  const { docId } = props;
  const {
    setDocument,
    parseData,
    setParsedData,
  } = useJSON();
  const { dataFormat } = useDataFormat();
  const { filteringPreference } = useManipulation();
  const itemViewRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) { return; }
    const f = async () => {
      const newDocument = {
        name: "",
        json_string: defaultRawText,
      };

      const setNewDocument = async () => {
        try {
          const clipboardText = await ClipboardAccess.pasteText();
          const sortedText = sortKeysJson(dataFormat, clipboardText, parseData);
          newDocument.json_string = sortedText;
          const newId = await JsonDocumentStore.saveDocument(newDocument);
          router.replace(`/${newId}`);
          toast("クリップボードの内容を取り込みました");
        } catch (e) {
          console.error("Failed to access clipboard:", e);
        }
        setDocument(newDocument);
      }

      let doc: JsonPartialDocument = newDocument
      if (docId === "new") {
        await setNewDocument();
      } else {
        const d = await (docId ? JsonDocumentStore.fetchDocument(docId) : JsonDocumentStore.fetchLatest())
        if (d) {
          router.replace(`/${d.id}`);
          setDocument(d);
          doc = d;
        } else {
          router.replace('/new');
          await setNewDocument();
        }
      }
      try {
        const json = parseData(doc.json_string);
        setParsedData({ status: "accepted", json, text: doc.json_string });
      } catch (e) {
        setParsedData({ status: "rejected", error: e, text: doc.json_string });
      }
    };
    f();
  }, [router.isReady, docId]);

  return (<div
    className="shrink grow flex flex-col"
  >
    <div
      className='shrink-0 grow-0 flex flex-col'>
      <HeaderBar itemViewRef={itemViewRef} />
    </div>

    <div
      className="shrink grow flex flex-row"
    >

      {
        filteringPreference.showPanel
          ? <div
            className="shrink-0 grow-0 w-96 flex flex-col justify-stretch"
          >
            <QueryView />
          </div>
          : null
      }

      <div
        className="shrink grow text-base"
      >
        <JsonItemsView itemViewRef={itemViewRef} />
      </div>

    </div>

    <div
      className="shrink-0 grow-0 flex flex-col"
    >
      <FooterBar itemViewRef={itemViewRef} />
    </div>
  </div>)
};
