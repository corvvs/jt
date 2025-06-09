import { v4 as uuidv4 } from 'uuid';
import { TransactionReadWrite, fetchItemById, fetchItemsIDB, getTransaction, saveItemIDB } from './indexed_db';
import _ from 'lodash';

export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type JsonDocumentPreview = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  jet_version: string;
};

export type JsonDocument = JsonDocumentPreview & {
  json_string: string;
};

export type JsonPartialDocument = PartialKeys<JsonDocument, "id" | "created_at" | "updated_at" | "jet_version">;

export function generateDocumentID() {
  return uuidv4();
}

const storeName = {
  JsonDocument: "JsonDocument",
  JsonDocumentPreview: "JsonDocumentPreview",
};

async function saveDocument(data: JsonPartialDocument) {

  const id = data.id || generateDocumentID();
  const now = new Date();
  if (!data.name) {
    data.name = (new Date()).toLocaleString();
  }
  const savedDocument: JsonDocument = {
    ...data,
    id,
    created_at: data.created_at || now,
    updated_at: now,
    jet_version: "0-alpha-1",
  };

  const transaction: TransactionReadWrite = await getTransaction(1, "readwrite", [
    storeName.JsonDocument, storeName.JsonDocumentPreview,
  ]);
  await saveItemIDB(transaction, storeName.JsonDocument, savedDocument);
  await saveDocumentPreview(transaction, savedDocument);

  return id;
}

async function saveDocumentPreview(transaction: TransactionReadWrite, data: JsonDocument) {
  const preview: JsonDocumentPreview = _.pick(data,
    "id",
    "name",
    "created_at",
    "updated_at",
    "jet_version",
  );
  await saveItemIDB(transaction, storeName.JsonDocumentPreview, preview);
}

async function fetchLatest() {
  const transaction = await getTransaction(1, "readonly", [
    storeName.JsonDocument, storeName.JsonDocumentPreview,
  ]);
  const result = await fetchItemsIDB(transaction, storeName.JsonDocumentPreview, { skip: 0, limit: 1 });
  if (result && result.data.length > 0) {
    return result.data[0] as JsonDocument;
  } else {
    return null;
  }
}

async function fetchDocument(id: string) {
  const transaction = await getTransaction(1, "readonly", [
    storeName.JsonDocument, storeName.JsonDocumentPreview,
  ]);
  return (await fetchItemById(transaction, storeName.JsonDocument, id)) as JsonDocument;
}

async function listPreviews(scope: { skip: number; limit: number; } = { skip: 0, limit: 100 }) {
  const transaction = await getTransaction(1, "readonly", [
    storeName.JsonDocument, storeName.JsonDocumentPreview,
  ]);
  const result = await fetchItemsIDB(transaction, storeName.JsonDocumentPreview, scope);
  if (!result) {
    return null; 
  }

  return {
    scope: result.scope,
    data: result.data as JsonDocument[],
  };
}


export const JsonDocumentStore = {
    fetchLatest,
    fetchDocument,
    saveDocument,
    listPreviews,
};
