import { v4 as uuidv4 } from 'uuid';
import { openDB } from 'idb';

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

const JetDatabaseName = "jet";

const IndexedDBParameters = {
  JsonDocument: {
    databaseName: JetDatabaseName,
    obejctStoreName: "JsonDocument",
  },
  JsonDocumentPreview: {
    databaseName: JetDatabaseName,
    obejctStoreName: "JsonDocumentPreview",
  }
};

async function saveDocument(data: JsonPartialDocument) {
  const {
    databaseName, obejctStoreName,
  } = IndexedDBParameters.JsonDocument;

  const db = await openDB(databaseName, 1, {
    upgrade(db) {
      db.createObjectStore(obejctStoreName, { keyPath: 'id', autoIncrement: true });
    },
  });
  const id = data.id || uuidv4();
  const now = new Date();
  const savedDocument: JsonDocument = {
    ...data,
    id,
    created_at: data.created_at || now,
    updated_at: now,
    jet_version: "0-alpha-1",
  };
  const store = db.transaction(obejctStoreName, "readwrite").objectStore(obejctStoreName);
  if (!store) {
    // FAIL!!
    return;
  }
  const result = await store.put(savedDocument);
  return result;
}

async function fetchLatest() {
  const {
    databaseName, obejctStoreName,
  } = IndexedDBParameters.JsonDocument;

  const db = await openDB(databaseName, 1, {
    upgrade(db) {
      const store = db.createObjectStore(obejctStoreName, { keyPath: "id" });
      store.createIndex("updated_at", "updated_at", { unique: false });
    },
  });

  const index = db.transaction(obejctStoreName).store.index('updated_at');
  const cursor = await index.openCursor(null, "prev");
  if (cursor) {
    return cursor.value as JsonDocument;
  } else {
    return undefined;
  }
}

async function fetchDocument(id: string) {

  const {
    databaseName, obejctStoreName,
  } = IndexedDBParameters.JsonDocument;

  const db = await openDB(databaseName, 1, {
    upgrade(db) {
      db.createObjectStore(obejctStoreName, { keyPath: 'id', autoIncrement: true });
    },
  });

  const store = db.transaction(obejctStoreName).objectStore(obejctStoreName);
  const document = await store.get(id);
  console.log("document", document);
  return document as JsonDocument;
}

async function listPreviews(scope: { skip: number; limit: number; } = { skip: 0, limit: 100 }) {

  const {
    databaseName, obejctStoreName,
  } = IndexedDBParameters.JsonDocumentPreview;

  const db = await openDB(databaseName, 1, {
    upgrade(db) {
      db.createObjectStore(obejctStoreName, { keyPath: 'id', autoIncrement: true });
    },
  });

  const index = db.transaction(obejctStoreName).store.index('created_at');
  let cursor = await index.openCursor(null, 'prev');
  if (!cursor) {
    // FAIL
    return null;
  }
  cursor = await cursor.advance(scope.skip)
  const data: JsonDocument[] = [];
  
  while (cursor && data.length < scope.limit) {
    data.push(cursor.value);
    cursor = await cursor.continue();
  }

  return {
    scope,
    data,
  };
}

export const useDocumentStorage = () => {
  return {
    fetchLatest,
    fetchDocument,
    saveDocument,
    listPreviews,
  };
};
