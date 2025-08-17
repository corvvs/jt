import { useEffect, useState, useRef } from "react";
import { JsonDocumentPreview, JsonDocumentStore } from "@/data/document";
import { useRouter } from "next/router";
import { FaRegClock, FaRegFile, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from "react-toastify";
import { HeaderBar } from "./lv3/HeaderBar";

export const DocumentList = () => {
  const [documents, setDocuments] = useState<JsonDocumentPreview[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<JsonDocumentPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const itemViewRef = useRef<any>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
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
        setError('ドキュメント一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // 検索フィルタリング
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
    } else {
      const filtered = documents.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDocuments(filtered);
    }
  }, [searchQuery, documents]);

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
        // ドキュメント一覧を更新
        const updatedDocuments = documents.filter(doc => doc.id !== docId);
        setDocuments(updatedDocuments);
        setFilteredDocuments(updatedDocuments.filter(doc => 
          !searchQuery.trim() || 
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.id.toLowerCase().includes(searchQuery.toLowerCase())
        ));
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">読み込み中...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FaRegFile className="text-4xl mb-4" />
          <p className="text-lg mb-2">保存されたドキュメントがありません</p>
          <p className="text-sm mb-4">新しいドキュメントを作成してデータを保存してください</p>
          <button
            onClick={handleNewDocument}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaPlus />
            新しいドキュメントを作成
          </button>
        </div>
      );
    }

    if (filteredDocuments.length === 0 && searchQuery) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FaRegFile className="text-4xl mb-4" />
          <p className="text-lg mb-2">検索条件に一致するドキュメントがありません</p>
          <p className="text-sm">検索条件を変更してください</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleDocumentClick(doc.id)}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium truncate">
                  {doc.name || '無題のドキュメント'}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <FaRegClock />
                    <span>更新: {formatDate(doc.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>作成: {formatDate(doc.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  ID: {doc.id.substring(0, 8)}...
                </div>
                <button
                  onClick={(e) => handleDeleteDocument(doc.id, doc.name, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
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

  return (
    <div className="h-full flex flex-col">
      <div
        className='shrink-0 grow-0 flex flex-col'>
          <HeaderBar itemViewRef={itemViewRef} mode="document-list" />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* 検索フィールド */}
          {documents.length > 0 && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="ドキュメント名やIDで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
