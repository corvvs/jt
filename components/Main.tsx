import { useJSON } from "@/states";
import { FlatJsonRow } from "./json/FlatJsonRow";
import { FixedSizeList, type ListOnItemsRenderedProps } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import _ from "lodash";
import { FooterBar } from "./lv3/FooterBar";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { FaRegFrown, FaRegMehRollingEyes } from 'react-icons/fa';
import { defaultRawText, effectiveItemsAtom, useVisibleItems, type ParsedJSONData } from "@/states/json";
import { useDiffTarget } from "@/states/diff";
import { toggleAtom } from "@/states/view";
import { useSetAtom, useStore } from "jotai";
import { HeaderBar } from "./lv3/HeaderBar";
import { useManipulation } from "@/states/manipulation";
import { QueryView } from "./query/QueryView";
import { useEditJsonModal, usePreformattedValueModal } from "@/states/modal";
import { useToggleSingle } from "@/states/view";
import { useRouter } from "next/router";
import { JsonPartialDocument, JsonDocumentStore, generateDocumentID } from "@/data/document";
import { ClipboardAccess } from "@/libs/sideeffect";
import { toast } from "react-toastify";
import { sortKeysJson } from "@/libs/tree_manipulation";
import { useDataFormat, DataFormat } from "@/states/config";
import { useMatchNavigation } from "@/hooks/useMatchNavigation";
import { isChangedDiffRow } from "@/libs/diff";
import { docPath, diffPath, SHARED_ROUTE_DOC_ID } from "@/libs/routes";
import { decodeSharePayload, deriveSharedDocId, shareErrorMessage } from "@/libs/share";
import { pendingViewStateAtom, applySharedViewState } from "@/states/share";
import { ProfileView } from "./profile/ProfileView";
import { useProfilePreference } from "@/states/profile";
import { PinsView } from "./pins/PinsView";
import { usePins, usePinsLoader, usePinsPreference } from "@/states/pins";
import { usePinNavigation } from "@/hooks/usePinNavigation";
import { MinimapView } from "./minimap/MinimapView";
import { useMinimapPreference, minimapViewportAtom } from "@/states/minimap";

interface VirtualScrollProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  itemSize: number;
  itemViewRef: MutableRefObject<any>;
  onItemsRendered?: (props: ListOnItemsRenderedProps) => void;
}

function VirtualScroll<T>({ data, renderItem, itemSize, itemViewRef, onItemsRendered }: VirtualScrollProps<T>) {
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
          onItemsRendered={onItemsRendered}
        >
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
}

const JsonItemsView = (props: {
  itemViewRef: MutableRefObject<any>;
  targetDocId: string | undefined;
  loadedDocId: string | undefined;
  isLoading: boolean;
}) => {
  const { json } = useJSON();
  const visibles = useVisibleItems();
  const { openModal } = useEditJsonModal();
  const manipulationHook = useManipulation();
  const toggleSingleHook = useToggleSingle();
  const pinsHook = usePins();
  const setViewport = useSetAtom(minimapViewportAtom);

  // targetDocIdとloadedDocIdが一致していない場合、またはロード中の場合はローディング表示
  if (props.isLoading || props.targetDocId !== props.loadedDocId) {
    return (
      <div className="h-full shrink grow gap-2 flex flex-col justify-center items-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
        key={item.index}
        item={item}
        manipulationHook={manipulationHook}
        toggleSingleHook={toggleSingleHook}
        pinsHook={pinsHook}
        gauge={gauge}
      />
      }
      itemSize={32} // 各アイテムの高さ
      onItemsRendered={({ visibleStartIndex, visibleStopIndex }) =>
        setViewport({ startIndex: visibleStartIndex, stopIndex: visibleStopIndex })
      }
    />
  );
}

export const Main = (props: {
  docId?: string;
  diffDocId?: string;
}) => {
  const { docId, diffDocId } = props;
  const {
    document: currentDocument,
    setDocument,
    parseData,
    setParsedData,
  } = useJSON();
  const { diffTarget, setDiffTarget } = useDiffTarget();
  const setToggleState = useSetAtom(toggleAtom);
  const prevDiffDocIdRef = useRef<string | undefined>(undefined);
  const loadGenerationRef = useRef(0);
  const store = useStore();
  // 共有リンクの hash は読み取り次第 URL から消すため, StrictMode の二重 effect 用に退避する
  const consumedShareHashRef = useRef<string | null>(null);
  const { dataFormat, setDataFormat } = useDataFormat();
  const { filteringPreference, setFilteringBooleanPreference, manipulation, popNarrowedRange, filterInputFocused, clearManipulation } = useManipulation();
  const { isOpen: isEditJsonModalOpen, openModal: openEditJsonModal } = useEditJsonModal();
  const { modalState: preformattedValueModalState } = usePreformattedValueModal();
  const { profilePreference, setShowProfilePanel } = useProfilePreference();
  const { pinsPreference, setShowPinsPanel } = usePinsPreference();
  // ミニマップは diff モード中も有効なので !diffTarget でゲートしない
  const { minimapPreference } = useMinimapPreference();
  // diff モード中は Profile/Pins は使えないので畳む.
  // preference 自体は書き換えないため, diff を抜けると元の開閉状態に復元される.
  const showProfilePanel = profilePreference.showPanel && !diffTarget;
  const showPinsPanel = pinsPreference.showPanel && !diffTarget;
  const { loadPinsForDocument } = usePinsLoader();
  const itemViewRef = useRef<any>(null);
  const matchNavigation = useMatchNavigation(itemViewRef);
  const diffNavigation = useMatchNavigation(itemViewRef, isChangedDiffRow);
  const pinNavigation = usePinNavigation(itemViewRef);
  // diff モード中に検索マッチがなければ, F3 系のジャンプは差分行を対象にする
  const activeNavigation = (diffDocId && matchNavigation.matchedCount === 0)
    ? diffNavigation
    : matchNavigation;
  const router = useRouter();

  // 表示しようとしているdocIDと、ロードが完了したdocIDを別々に管理
  const [targetDocId, setTargetDocId] = useState<string | undefined>(docId);
  const [loadedDocId, setLoadedDocId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  // console.log("docId", docId, "targetDocId", targetDocId, "loadedDocId", loadedDocId, "isLoading", isLoading)

  // docIdが変更された時に即座にtargetDocIdを更新
  useEffect(() => {
    if (targetDocId !== docId) {
      setTargetDocId(docId);
      setIsLoading(true);
      // 新しいdocIdに変更された場合、loadedDocIdをリセット
      setLoadedDocId(undefined);
    }
  }, [docId, targetDocId]);

  // ロード完了したドキュメントに付随するピンを読み込む
  useEffect(() => {
    loadPinsForDocument(loadedDocId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedDocId]);

  useEffect(() => {
    if (!router.isReady) { return; }
    // docId prop → targetDocId の同期が済むまでロードを見送る.
    // 同期前に走ると, 古い targetDocId のまま URL 正規化 (router.replace) が実行され,
    // 遷移直後の URL を巻き戻してしまう (diff の Swap 時のチラつきの原因)
    if (targetDocId !== docId) { return; }

    // このロードより新しいロードが始まったら, 途中結果を捨てるための世代トークン
    const generation = ++loadGenerationRef.current;
    const isStale = () => loadGenerationRef.current !== generation;

    const f = async () => {
      const currentTargetDocId = targetDocId;
      setIsLoading(true);

      const parseToData = (text: string): ParsedJSONData => {
        try {
          return { status: "accepted", json: parseData(dataFormat, text), text };
        } catch (e) {
          return { status: "rejected", error: e, text };
        }
      };

      // 比較相手 (旧側) の fetch は本体ドキュメントの処理と並走させる
      const otherDocPromise = diffDocId ? JsonDocumentStore.fetchDocument(diffDocId) : null;

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

      // 共有リンクの取り込み (1周目). 成功時は router.replace で通常ロード (2周目) に引き継ぐ
      if (currentTargetDocId === SHARED_ROUTE_DOC_ID) {
        // fragment は最初に URL から消す: デコードや保存の await 中に計測 beacon 等が
        // location を読んでも, 共有データが載っていない状態にする
        const rawHash = window.location.hash || consumedShareHashRef.current || "";
        consumedShareHashRef.current = rawHash;
        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        try {
          const payload = await decodeSharePayload(rawHash);
          if (isStale()) { return; }
          if (payload.doc.format !== dataFormat) {
            setDataFormat(payload.doc.format);
          }
          const sharedId = await deriveSharedDocId(payload.doc);
          const existing = await JsonDocumentStore.fetchDocument(sharedId);
          if (isStale()) { return; }
          // 受信者が同じ共有ドキュメントをローカル編集済みの場合は上書きせず別ドキュメントにする
          const saveId = existing && existing.json_string !== payload.doc.json_string
            ? generateDocumentID()
            : sharedId;
          if (!existing || saveId !== sharedId) {
            await JsonDocumentStore.saveDocument({
              id: saveId,
              name: payload.doc.name,
              json_string: payload.doc.json_string,
            });
            if (isStale()) { return; }
          }
          store.set(pendingViewStateAtom, { docId: saveId, view: payload.view });
          consumedShareHashRef.current = null;
          router.replace(docPath(saveId));
          toast("共有リンクからドキュメントを取り込みました");
        } catch (e) {
          // StrictMode の二重 effect で古い世代が失敗しても, toast や遷移は新しい世代に任せる
          if (isStale()) { return; }
          console.error("Failed to import shared document:", e);
          consumedShareHashRef.current = null;
          toast.error(shareErrorMessage(e));
          router.replace('/_list');
        }
        // setLoadedDocId しない: Loading 表示のまま replace 先のロードに引き継ぐ
        return;
      }

      let doc: JsonPartialDocument = newDocument
      let actualDocId = currentTargetDocId;

      if (currentTargetDocId === "new") {
        await setNewDocument();
        actualDocId = "new";
      } else if (currentTargetDocId) {
        const d = await (JsonDocumentStore.fetchDocument(currentTargetDocId))
        if (isStale()) { return; }
        if (d) {
          // URL の正規化. diff モードの場合は diff セグメントを保持する
          router.replace(diffDocId ? diffPath(d.id, diffDocId) : docPath(d.id));
          setDocument(d);
          doc = d;
          actualDocId = d.id;
        } else {
          router.replace('/new');
          await setNewDocument();
          actualDocId = "new";
        }
      } else {
          // この分岐は通常発生しないはず（ページレベルで制御されているため）
          router.replace('/new');
          await setNewDocument();
          actualDocId = "new";
      }
      
      const other = otherDocPromise ? await otherDocPromise : null;

      // 処理中に別のロードが始まっていた場合は、この結果を無視
      if (isStale()) { return; }

      // NOTE: ここから先の状態更新は同一同期ブロックで行う.
      // parsedJson と diffTarget の更新が別フラッシュに割れると,
      // 中間の食い違ったペアで diffJson が1回無駄に走る
      setParsedData(parseToData(doc.json_string));

      // diff モードの場合は比較相手 (旧側) を反映する
      if (diffDocId) {
        const parsedOther = other ? parseToData(other.json_string) : null;
        if (other && parsedOther?.status === "accepted") {
          setDiffTarget({ docId: other.id, name: other.name, parsed: parsedOther });
        } else {
          toast.error(other
            ? "比較相手のドキュメントをパースできませんでした"
            : "比較相手のドキュメントが見つかりません");
          setDiffTarget(null);
          router.replace(docPath(actualDocId));
        }
      } else {
        setDiffTarget(null);
      }

      // diff モードの出入りで行アイテムの index 空間が変わるため, 操作状態をリセットする
      if (prevDiffDocIdRef.current !== diffDocId) {
        clearManipulation();
        setToggleState({});
        prevDiffDocIdRef.current = diffDocId;
      }

      // 共有リンク由来のビュー状態を, Loading 表示が外れる前に注入する.
      // setParsedData 直後なので effectiveItemsAtom は新しい flatten 結果を返す (計算はキャッシュされ再利用される)
      const pendingViewState = store.get(pendingViewStateAtom);
      if (pendingViewState) {
        if (pendingViewState.docId === actualDocId && !diffDocId) {
          const flattened = store.get(effectiveItemsAtom);
          if (flattened) {
            applySharedViewState(store, flattened.items, pendingViewState.view);
          }
        }
        // docId 不一致でも破棄する: 別ドキュメントへの取り違え適用を防ぐ
        store.set(pendingViewStateAtom, null);
      }

      // ロードが完了したdocIDを設定し、ローディング状態を解除
      setLoadedDocId(actualDocId);
      setIsLoading(false);
    };
    f();
  }, [router.isReady, targetDocId, docId, diffDocId]);

  // キーボードショートカット（Ctrl+F / Cmd+F）でフィルターパネルをトグルする
  // キーボードショートカット（Ctrl+E / Cmd+E）でEditモーダルを開く
  // キーボードショートカット（Ctrl+A / Cmd+A）でNewボタンと同じ動作
  // キーボードショートカット（Esc）でナローイングを解除する
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditJsonModalOpen || preformattedValueModalState.isOpen) {
        return;
      }

      // フィルター入力欄がフォーカスされている場合は、Cmd+F以外のショートカットを無効にする
      if (filterInputFocused) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
          event.preventDefault(); // デフォルト検索を奪う
          setFilteringBooleanPreference("showPanel", !filteringPreference.showPanel);
        }
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault(); // デフォルト検索を奪う
        setFilteringBooleanPreference("showPanel", !filteringPreference.showPanel);
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault(); // デフォルトの動作を防ぐ
        openEditJsonModal();
      }

      // Cmd+P: プロファイルパネルをトグルする
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'p') {
        event.preventDefault(); // 印刷ダイアログを奪う
        // diff モード中はプロファイルを使えないのでトグルしない (ヘッダーボタンも disabled)
        if (!diffTarget) { setShowProfilePanel(!profilePreference.showPanel); }
      }

      // Cmd+Shift+P: ピンパネルをトグルする
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'P' || event.key === 'p')) {
        event.preventDefault();
        // diff モード中はピンを使えないのでトグルしない (ヘッダーボタンも disabled)
        if (!diffTarget) { setShowPinsPanel(!pinsPreference.showPanel); }
      }

      // Cmd+Shift+A: クリップボードの内容を現在のタブに取り込む
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'A' || event.key === 'a')) {
        event.preventDefault();
        (async () => {
          try {
            const clipboardText = await ClipboardAccess.pasteText();
            const sortedText = sortKeysJson(dataFormat, clipboardText, parseData);
            const newDoc = { name: "", json_string: sortedText };
            const newId = await JsonDocumentStore.saveDocument(newDoc);
            router.replace(`/${newId}`);
            toast("クリップボードの内容を取り込みました");
          } catch (e) {
            console.error("Failed to access clipboard:", e);
          }
        })();
      }

      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'a') {
        event.preventDefault(); // デフォルトの動作を防ぐ
        window.open('/new', '_blank');
      }

      if (event.key === 'Escape' && manipulation.narrowedRanges.length > 0) {
        event.preventDefault(); // デフォルトの動作を防ぐ
        popNarrowedRange(-1);
      }

      // F3 / Shift+F3: 次/前のマッチした行に移動
      if (event.key === 'F3') {
        event.preventDefault();
        if (event.shiftKey) {
          activeNavigation.goToPreviousMatch();
        } else {
          activeNavigation.goToNextMatch();
        }
      }

      // Ctrl+G / Ctrl+Shift+G: 次/前のマッチした行に移動（代替ショートカット）
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        if (event.shiftKey) {
          activeNavigation.goToPreviousMatch();
        } else {
          activeNavigation.goToNextMatch();
        }
      }

      // Ctrl+1: 最初のマッチした行に移動
      if ((event.ctrlKey || event.metaKey) && event.key === '1') {
        event.preventDefault();
        activeNavigation.goToFirstMatch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteringPreference.showPanel, setFilteringBooleanPreference, profilePreference.showPanel, setShowProfilePanel, pinsPreference.showPanel, setShowPinsPanel, diffTarget, isEditJsonModalOpen, preformattedValueModalState.isOpen, openEditJsonModal, manipulation, popNarrowedRange, filterInputFocused, activeNavigation, router, dataFormat, parseData]);

  // ファイルドラッグ&ドロップ機能
  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handleDrop = async (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];
      const fileName = file.name.toLowerCase();
      
      // ファイル拡張子をチェックしてフォーマットを決定
      let targetFormat: DataFormat;
      let fileExtension: string;
      const extension = fileName.split('.').pop();
      switch (extension) {
        case 'json':
          targetFormat = 'json';
          fileExtension = '.json';
          break;
        case 'jsonl':
          targetFormat = 'jsonl';
          fileExtension = '.jsonl';
          break;
        default:
          toast.error('サポートするファイルは.json, .jsonlのみです');
          return;
      }

      try {
        const fileContent = await file.text();
        const json = parseData(targetFormat, fileContent);
        
        const newDocument = {
          ...currentDocument,
          name: file.name.replace(fileExtension, ''),
          json_string: fileContent,
        };
        setDataFormat(targetFormat);
        setDocument(newDocument);
        setParsedData({ status: "accepted", json, text: fileContent });
        const id = await JsonDocumentStore.saveDocument(newDocument);
        const [docId] = (router.query.docId || []) as string[];
        if (id !== docId) {
          router.replace(`/${id}`);
        }

        toast.success(`${file.name} を読み込みました`);
      } catch (error) {
        console.error('Parse error:', error);
        // エラー時は元のフォーマット設定に戻す
        setDataFormat(dataFormat);
        toast.error(`${targetFormat.toUpperCase()}ファイルの解析に失敗しました`);
      }
    };

    // イベントリスナーを追加
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [parseData, setDocument, setParsedData, dataFormat, setDataFormat]);

  return (<div
    className="shrink grow flex flex-col"
  >
    <div className='shrink-0 grow-0 flex flex-col'>
      <HeaderBar itemViewRef={itemViewRef} mode="json-viewer" diffNavigation={diffNavigation} />
    </div>

    <div
      className="shrink grow flex flex-row"
    >

      <div
        className={`filter-panel-container shrink-0 grow-0 flex flex-col justify-stretch transition-all duration-100 ease-out overflow-hidden ${
          filteringPreference.showPanel ? 'w-96' : 'w-0'
        }`}
      >
        <div 
          className={`filter-panel-inner w-96 h-full transition-transform duration-300 ease-out flex flex-col ${
            filteringPreference.showPanel ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <QueryView matchNavigation={matchNavigation} />
        </div>
      </div>

      <div
        className="shrink grow text-base"
      >
        <JsonItemsView
          itemViewRef={itemViewRef}
          targetDocId={targetDocId}
          loadedDocId={loadedDocId}
          isLoading={isLoading}
        />
      </div>

      {minimapPreference.showPanel && (
        <div className="minimap-container shrink-0 grow-0 w-4">
          <MinimapView itemViewRef={itemViewRef} />
        </div>
      )}

      <div
        className={`profile-panel-container shrink-0 grow-0 flex flex-col justify-stretch transition-all duration-100 ease-out overflow-hidden ${
          showProfilePanel ? 'w-96' : 'w-0'
        }`}
      >
        <div
          className={`profile-panel-inner w-96 h-full transition-transform duration-300 ease-out flex flex-col ${
            showProfilePanel ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* パネルを閉じている間はマウントしない (profileAtom の購読を切り, 計算を止める) */}
          {showProfilePanel && <ProfileView />}
        </div>
      </div>

      <div
        className={`pins-panel-container shrink-0 grow-0 flex flex-col justify-stretch transition-all duration-100 ease-out overflow-hidden ${
          showPinsPanel ? 'w-96' : 'w-0'
        }`}
      >
        <div
          className={`pins-panel-inner w-96 h-full transition-transform duration-300 ease-out flex flex-col ${
            showPinsPanel ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {showPinsPanel && <PinsView pinNavigation={pinNavigation} />}
        </div>
      </div>

    </div>

    <div
      className="shrink-0 grow-0 flex flex-col"
    >
      <FooterBar itemViewRef={itemViewRef} />
    </div>
  </div>)
};
