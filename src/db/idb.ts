import { openDB } from "idb";
import type { Collection } from "../models/collection";

const DB_NAME = "notes-db";
const DB_VERSION = 3;

export type defaultCollectionId = 1 | 2;

export const stores = {
  NOTES: "notes",
  COLLECTIONS: "collections",
} as const;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("notes")) {
      const notes = db.createObjectStore("notes", {
        keyPath: "id",
        autoIncrement: true,
      });
      // notes.createIndex("byCollectionDeletedCreated", [
      //   "collectionId",
      //   "isDeleted",
      //   "createdAt",
      // ]);
      // notes.createIndex("byCollectionDeletedId", [
      //   "collectionId",
      //   "isDeleted",
      //   "id",
      // ]);
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
        id: 1,
        name: "default",
        createdAt: new Date().toISOString(),
        isDeleted: false,
      };
      const temporaryCollection: Collection = {
        id: 2,
        name: "temporary",
        createdAt: new Date().toISOString(),
        isDeleted: false,
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
