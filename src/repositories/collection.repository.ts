import { dbPromise } from "../db/idb";
import { stores } from "../db/idb";
import type { PaginatedResult } from "../types/paginated.result";
import type { Collection } from "../models/collection";

export class CollectionRepository {
  static async create(collectionName: string): Promise<Collection> {
    const db = await dbPromise;
    const newCollection: Omit<Collection, "id"> = {
      name: collectionName,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };
    const id = await db.add(stores.COLLECTIONS, newCollection);
    let parsedId = Number(id);
    return { id: parsedId, ...newCollection };
  }

  static async exists(
    collectionName: string,
    excludeId?: number,
  ): Promise<boolean> {
    const db = await dbPromise;
    const collectionDetail: Collection = await db.getFromIndex(
      stores.COLLECTIONS,
      "name",
      collectionName,
    );
    if (!collectionDetail) return false;
    if (excludeId !== undefined && collectionDetail.id === excludeId) {
      return false;
    }
    return true;
  }

  static async update(collection: Collection) {
    const db = await dbPromise;
    await db.put(stores.COLLECTIONS, collection);
    return collection;
  }

  static async get(id: number): Promise<Collection | null>;
  static async get(collectionName: string): Promise<Collection | null>;
  static async get(idOrName: number | string): Promise<Collection | null> {
    const db = await dbPromise;
    let collection: Collection | null = null;

    if (typeof idOrName === "string" && idOrName.trim().length >= 1) {
      collection = await db.getFromIndex(stores.COLLECTIONS, "name", idOrName);
    } else if (typeof idOrName === "number" && idOrName > 0) {
      collection = await db.get(stores.COLLECTIONS, idOrName);
    }

    if (collection?.isDeleted) {
      return null;
    }
    return collection;
  }

  static async getAll(
    lastKey?: string | null,
    pageSize: number = 30,
    onlyDeleted: boolean = false,
  ): Promise<PaginatedResult<Collection>> {
    const db = await dbPromise;
    const tx = db.transaction(stores.COLLECTIONS, "readonly");
    const store = tx.objectStore(stores.COLLECTIONS);
    const index = store.index("createdAt");
    const now = new Date().toISOString();
    const range = lastKey
      ? IDBKeyRange.upperBound(lastKey, true)
      : IDBKeyRange.upperBound(now);

    let collections: Collection[] = [];
    let cursor = await index.openCursor(range, "prev");
    while (cursor && collections.length < pageSize + 1) {
      if (cursor.value.isDeleted === onlyDeleted) {
        collections.push(cursor.value);
      }
      cursor = await cursor.continue();
    }
    await tx.done;
    const resultData = collections.slice(0, pageSize);
    let newLastKey = resultData[resultData.length - 1]?.createdAt || null;
    return {
      data: resultData,
      pageSize,
      lastKey: newLastKey,
      hasMore: collections.length > pageSize,
    };
  }

  static async softDelete(id: number) {
    const collectionDetail = await this.get(id);
    if (!collectionDetail) throw new Error("Collection not found");
    const timestamp = new Date().toISOString();
    collectionDetail.name = `${collectionDetail.name}:deleted:${timestamp}`;
    collectionDetail.isDeleted = true;
    await this.update(collectionDetail);
  }

  static async permanentDelete(id: number) {
    // Destructive action !!
    const db = await dbPromise;
    const tx = db.transaction([stores.COLLECTIONS, stores.NOTES], "readwrite");
    await tx.objectStore(stores.COLLECTIONS).delete(id);
    const store = tx.objectStore(stores.NOTES);
    const index = store.index("byCollectionId");
    const collectionId = Number(id);
    let cursor = await index.openKeyCursor(
      IDBKeyRange.bound(
        [collectionId, 0], // collectionId, id
        [collectionId, Infinity],
      ),
    );
    while (cursor) {
      await store.delete(cursor.primaryKey);
      cursor = await cursor.continue();
    }
    await tx.done;
  }

  static async restore(collection: Collection): Promise<Collection> {
    collection.isDeleted = false;
    const restoredCollection = await this.update(collection);
    return restoredCollection;
  }
}
