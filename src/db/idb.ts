import { openDB } from "idb";

const DB_NAME = "notes-db";
const DB_VERSION = 1;

export const defaultStores = {
  COLLECTION_DETAILS: "collection_details",
  DEFAULT_NOTES: "default_notes",
  GARBAGE_NOTES: "garbage_notes",
  TEMPORARY_NOTES: "temporary_notes",
} as const;

export type DefaultStores = (typeof defaultStores)[keyof typeof defaultStores];

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(defaultStores.COLLECTION_DETAILS)) {
      const store = db.createObjectStore(defaultStores.COLLECTION_DETAILS, {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("collectionName", "collectionName", {
        unique: true,
      });
      store.createIndex("createdAt", "createdAt");
      store.createIndex("byDeletedId", ["isDeleted", "id"]);
    }

    if (!db.objectStoreNames.contains(defaultStores.DEFAULT_NOTES)) {
      const store = db.createObjectStore(defaultStores.DEFAULT_NOTES, {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("createdAt", "createdAt");
    }

    if (!db.objectStoreNames.contains(defaultStores.GARBAGE_NOTES)) {
      const store = db.createObjectStore(defaultStores.GARBAGE_NOTES, {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("createdAt", "createdAt");
    }

    if (!db.objectStoreNames.contains(defaultStores.TEMPORARY_NOTES)) {
      const store = db.createObjectStore(defaultStores.TEMPORARY_NOTES, {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("createdAt", "createdAt");
      store.createIndex("expiresAt", "expiresAt");
    }
  },
  blocked() {
    console.error("Database is blocked");
  },
  blocking() {
    console.error("Database is blocking");
  },
  terminated() {
    console.error("Database is terminated");
  },
});
