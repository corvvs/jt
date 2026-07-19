import { getTransaction, fetchItemById, saveItemIDB, deleteItemIDB, JetStoreNames } from './indexed_db';
import { DocumentPin } from '@/libs/pins';

/**
 * ピンの永続化. ドキュメント 1 件につきレコード 1 件 (id = doc_id) で持つ.
 * ドキュメント本体 (数MB になりうる) を書き直さずにピンだけ更新するため,
 * JsonDocument とは別ストアにしている.
 */
type DocumentPinsRecord = {
  id: string;
  pins: DocumentPin[];
  updated_at: Date;
};

async function fetchPins(docId: string): Promise<DocumentPin[]> {
  const transaction = await getTransaction("readonly", [JetStoreNames.DocumentPins]);
  const record = (await fetchItemById(transaction, JetStoreNames.DocumentPins, docId)) as DocumentPinsRecord | undefined;
  return record?.pins ?? [];
}

async function savePins(docId: string, pins: DocumentPin[]) {
  const transaction = await getTransaction("readwrite", [JetStoreNames.DocumentPins]);
  if (pins.length === 0) {
    await deleteItemIDB(transaction, JetStoreNames.DocumentPins, docId);
    return;
  }
  const record: DocumentPinsRecord = {
    id: docId,
    pins,
    updated_at: new Date(),
  };
  await saveItemIDB(transaction, JetStoreNames.DocumentPins, record);
}

export const DocumentPinsStore = {
  fetchPins,
  savePins,
};
