import { IDBPTransaction, openDB } from 'idb';
import _ from 'lodash';

const JetDatabaseName = "jet";

export type TransactionReadWrite = IDBPTransaction<unknown, string[], "readwrite">;
export type TransactionReadOnly = IDBPTransaction<unknown, string[], "readonly">;

export async function getTransaction<TT extends "readwrite" | "readonly">(
  version: number,
  transactionType: TT,
  stores: string[],
) {
  const db = await openDB(JetDatabaseName, version, {
    upgrade(db) {
      stores.forEach(storeName => {
        const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        store.createIndex("updated_at", "updated_at", { unique: false });
      });
    },
  });
  return db.transaction(stores, transactionType);
}

export async function saveItemIDB(
  transaction: TransactionReadWrite,
  store: string,
  data: { id: string } & any,
) {
  const st = transaction.objectStore(store);
  if (!st) {
    // FAIL!!
    return;
  }
  const result = await st.put(data);
}

export async function fetchItemById(
  transaction: TransactionReadOnly,
  store: string,
  id: string,
) {
  const st = transaction.objectStore(store);
  const document = await st.get(id);
  return document;
}

export async function fetchItemsIDB(
  transaction: TransactionReadOnly,
  store: string,
  scope: { skip: number; limit: number; },
) {
  const index = transaction.objectStore(store).index('updated_at');
  let cursor = await index.openCursor(null, 'prev');
  if (!cursor) {
    // FAIL
    return null;
  }
  cursor = await cursor.advance(scope.skip)
  const data: any[] = [];
  
  while (cursor && data.length < scope.limit) {
    data.push(cursor.value);
    cursor = await cursor.continue();
  }
  return {
    scope,
    data,
  };
}
