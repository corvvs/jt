import { useEffect, useState, useRef } from "react";
import { JsonDocumentPreview, JsonDocumentStore } from "@/data/document";
import { useRouter } from "next/router";
import { FaRegClock, FaRegFile, FaPlus, FaTrash, FaCalendarAlt, FaRegFrown } from 'react-icons/fa';
import { toast } from "react-toastify";
import { HeaderBar } from "./lv3/HeaderBar";
import { MultipleButtons } from "./lv1/MultipleButtons";
import { InlineIcon } from "./lv1/InlineIcon";

type SortOption = 'created_desc' | 'updated_desc';

const DocumentListBody = () => {
  const [documents, setDocuments] = useState<JsonDocumentPreview[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<JsonDocumentPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('updated_desc');
  const router = useRouter();

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await JsonDocumentStore.listPreviews({ skip: 0, limit: 100 });
        if (result) {
          setDocuments(result.data);
          setFilteredDocuments(result.data);
        } else {
          setDocuments([]);
          setFilteredDocuments([]);
        }
      } catch (err) {
        console.error('ドキュメント一覧の取得に失敗しました:', err);
        // IndexedDBが利用できない場合などの詳細なエラーメッセージ
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('IDBDatabase') || errorMessage.includes('IndexedDB')) {
          setError('ローカルストレージ（IndexedDB）にアクセスできません。ブラウザの設定を確認してください。');
        } else {
          setError('ドキュメント一覧の取得に失敗しました。しばらく待ってから再度お試しください。');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // 検索フィルタリングとソート
  useEffect(() => {
    let filtered = documents;
    
    // 検索フィルタリング
    if (searchQuery.trim()) {
      filtered = documents.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // ソート
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated_desc':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredDocuments(sorted);
  }, [searchQuery, documents, sortOption]);

  const handleDocumentClick = (docId: string) => {
    router.push(`/${docId}`);
  };

  const handleNewDocument = () => {
    router.push('/new');
  };

  const handleDeleteDocument = async (docId: string, docName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // ドキュメントクリックイベントを防ぐ
    
    if (confirm(`"${docName || '無題のドキュメント'}" を削除しますか？この操作は元に戻せません。`)) {
      try {
        await JsonDocumentStore.deleteDocument(docId);
        // ドキュメント一覧を更新（useEffectでソートが自動適用される）
        const updatedDocuments = documents.filter(doc => doc.id !== docId);
        setDocuments(updatedDocuments);
        toast.success('ドキュメントを削除しました');
      } catch (err) {
        console.error('ドキュメントの削除に失敗しました:', err);
        toast.error('ドキュメントの削除に失敗しました');
      }
    }
  };

  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number | undefined) => {
    if (bytes === undefined) return '不明';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getSizeStyleClass = (bytes: number | undefined) => {
    if (bytes === undefined) {
      return 'text-gray-400 dark:text-gray-500'; // 不明の場合は薄いグレー
    }
    
    const k = 1024;
    if (bytes < k * k) { // 1MB未満（KB以下）
      return 'text-gray-500 dark:text-gray-400'; // 通常色
    } else if (bytes < k * k * k) { // 1GB未満（MB）
      return 'text-orange-600 dark:text-orange-400 font-medium'; // 警告色
    } else { // 1GB以上
      return 'text-red-600 dark:text-red-400 font-bold'; // 危険色
    }
  };

  if (loading) {
    return (
      <div className="shrink grow flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shrink grow flex flex-col items-center justify-center h-64 text-gray-500">
        <FaRegFile className="text-4xl mb-4 text-red-400" />
        <p className="text-lg mb-2 text-red-500">エラーが発生しました</p>
        <p className="text-sm mb-4 text-center max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div
        className="shrink grow flex flex-col items-center justify-center h-64 text-gray-500 cursor-pointer"
        onClick={handleNewDocument}
      >
        <FaRegFrown className="text-4xl mb-4" />
        <p className="text-lg mb-2">No Stored Documents.</p>
      </div>
    );
  }

  const renderContent = () => {
    if (filteredDocuments.length === 0 && searchQuery) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FaRegFrown className="text-4xl mb-4" />
          <p className="text-lg mb-2">No Matching Documents Found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleDocumentClick(doc.id)}
            className="document-list-item"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium truncate">
                  {doc.name || '無題のドキュメント'}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <FaRegClock />
                    <span>更新: <span className="font-mono">{formatDate(doc.updated_at)}</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>作成: <span className="font-mono">{formatDate(doc.created_at)}</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>サイズ: </span>
                    <span className={getSizeStyleClass(doc.data_size)}>
                      {formatSize(doc.data_size)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  ID: {doc.id.substring(0, 8)}...
                </div>
                <button
                  onClick={(e) => handleDeleteDocument(doc.id, doc.name, e)}
                  className="document-delete-button"
                  title="削除"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return <div className="shrink grow p-6 flex flex-col overflow-y-hidden">
    {documents.length > 0 && (
      <div className="shrink-0 grow-0 max-w-4xl mb-6 pr-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="ドキュメント名やIDで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="document-search-input"
          />
          <div className="flex items-center gap-2">
            <MultipleButtons
              currentKey={sortOption}
              items={[
                {
                  key: "updated_desc",
                  content: <div className="h-[1.5rem] flex items-center">
                    <InlineIcon i={<FaRegClock />} />
                    <span className="p-1">Updated At</span>
                  </div>
                },
                {
                  key: "created_desc",
                  content: <div className="h-[1.5rem] flex items-center">
                    <InlineIcon i={<FaCalendarAlt />} />
                    <span className="p-1">Created At</span>
                  </div>
                },
              ]}
              onClick={(item) => {
                setSortOption(item.key as SortOption);
              }}
            />
          </div>
        </div>
      </div>
    )}
    <div className="shrink grow max-w-4xl pr-6 overflow-y-auto">
      {renderContent()}
    </div>
  </div>;
}


export const DocumentList = () => {
  const itemViewRef = useRef<any>(null);

  return (
    <div className="shrink grow flex flex-col">
      <div className='shrink-0 grow-0 flex flex-col'>
        <HeaderBar itemViewRef={itemViewRef} mode="document-list" />
      </div>
      <DocumentListBody />
    </div>
  );
};
