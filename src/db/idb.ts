import { openDB } from "idb";
import type { Collection } from "../models/collection";

export const DB_NAME = "notes-db";
const DB_VERSION = 3;
export const stores = {
  NOTES: "notes",
  COLLECTIONS: "collections",
} as const;
const DEFAULT_COLLECTION_ID = 1;
const TEMPORARY_COLLECTION_ID = 2;
export const defaultCollectionsIds = {
  DEFAULT_NOTES: DEFAULT_COLLECTION_ID,
  TEMPORARY_NOTES: TEMPORARY_COLLECTION_ID,
} as const;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("notes")) {
      const notes = db.createObjectStore("notes", {
        keyPath: "id",
        autoIncrement: true,
      });
      notes.createIndex("byCollectionId", ["collectionId", "id"]);
      notes.createIndex("byCollectionCreated", ["collectionId", "createdAt"]);
      notes.createIndex("expiresAt", "expiresAt");
    }

    if (!db.objectStoreNames.contains("collections")) {
      const collections = db.createObjectStore("collections", {
        keyPath: "id",
        autoIncrement: true,
      });
      collections.createIndex("name", "name", {
        unique: true,
      });
      collections.createIndex("createdAt", "createdAt");
      collections.createIndex("byDeletedId", ["isDeleted", "id"]);

      const defaultCollection: Collection = {
        id: DEFAULT_COLLECTION_ID,
        name: "default",
        createdAt: new Date().toISOString(),
        isDeleted: false,
        hasDeletedNotes: false,
        currentSize: 0,
        maxSize: 1000,
      };
      const temporaryCollection: Collection = {
        id: TEMPORARY_COLLECTION_ID,
        name: "temporary",
        createdAt: new Date().toISOString(),
        isDeleted: false,
        hasDeletedNotes: false,
        currentSize: 0,
        maxSize: 1000,
      };
      collections.add(defaultCollection);
      collections.add(temporaryCollection);
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
