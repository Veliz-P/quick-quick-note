import { dbPromise } from "../db/idb";
import type { PaginatedResult } from "../types/paginated.result";
import { stores } from "../db/idb";
import type { Collection } from "../models/collection";
export class CollectionService {
  static async createCollection(collectionName: string): Promise<Collection> {
    if (
      !collectionName ||
      collectionName.trim().length <= 1 ||
      collectionName.trim().length > 50
    )
      throw new Error(
        "Invalid collection name, must be between 2 and 50 characters",
      );

    const db = await dbPromise;
    if (await this.collectionExists(collectionName))
      throw new Error("Collection already exists");

    const newCollection: Omit<Collection, "id"> = {
      name: collectionName,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };
    const id = await db.add(stores.COLLECTIONS, newCollection);

    let parsedId = Number(id);
    return { id: parsedId, ...newCollection };
  }

  static async collectionExists(
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

  static async updateCollection(collection: Collection) {
    const db = await dbPromise;
    if (
      !collection ||
      collection.name.trim().length <= 1 ||
      collection.name.trim().length > 50
    )
      throw new Error("Invalid collection name");
    if (!collection.id || collection.id <= 0)
      throw new Error("Collection id is required");
    if (await this.collectionExists(collection.name, collection.id))
      throw new Error("Collection already exists");
    await db.put(stores.COLLECTIONS, collection);
    return collection;
  }

  static async getCollection(id: number): Promise<Collection | null>;
  static async getCollection(
    collectionName: string,
  ): Promise<Collection | null>;
  static async getCollection(
    idOrName: number | string,
  ): Promise<Collection | null> {
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

  static async getCollections(
    lastkey?: number,
    onlyDeleted: boolean = false,
    pageSize: number = 30,
  ): Promise<PaginatedResult<Collection>> {
    const db = await dbPromise;
    const tx = db.transaction(stores.COLLECTIONS, "readonly");
    const store = tx.objectStore(stores.COLLECTIONS);
    const index = store.index("byDeletedId");
    const range = lastkey
      ? IDBKeyRange.lowerBound([onlyDeleted, lastkey], true)
      : IDBKeyRange.lowerBound([onlyDeleted, 0]);

    let collections: Collection[] = [];
    let cursor = await index.openCursor(range);
    let newLastKey: number | null = null;
    while (cursor && collections.length < pageSize) {
      collections.push(cursor.value);
      newLastKey = Number(cursor.key) || null;
      cursor = await cursor.continue();
    }
    await tx.done;

    return {
      data: collections,
      pageSize,
      lastKey: newLastKey,
      hasMore: newLastKey !== null && collections.length === pageSize,
    };
  }

  static async softDeleteCollection(id: number) {
    if (!id || id <= 0) throw new Error("Invalid collection id");
    const collectionDetail = await this.getCollection(id);
    if (!collectionDetail) throw new Error("Collection not found");
    collectionDetail.isDeleted = true;
    await this.updateCollection(collectionDetail);
  }

  static async deleteCollection(id: number) {
    // Destructive action !!
    if (!id || id <= 0) throw new Error("Invalid collection id");
    const collectionDetail = await this.getCollection(id);
    if (!collectionDetail) throw new Error("Collection not found");

    const db = await dbPromise;
    const tx = db.transaction([stores.COLLECTIONS, stores.NOTES], "readwrite");

    await tx.objectStore(stores.COLLECTIONS).delete(id);
    const store = tx.objectStore(stores.NOTES);
    const index = store.index("byCollectionDeletedCreated");
    const collectionId = Number(id);

    let cursor = await index.openKeyCursor(
      IDBKeyRange.bound(
        [collectionId, false, ""], // collectionId, isDeleted, createdAt
        [collectionId, true, "\uffff"],
      ),
    );
    while (cursor) {
      await store.delete(cursor.primaryKey);
      cursor = await cursor.continue();
    }
    await tx.done;
  }

  static async restoreCollection(id: number): Promise<Collection> {
    if (!id || id <= 0) throw new Error("Invalid collection id");
    const collectionDetail = await this.getCollection(id);
    if (!collectionDetail) throw new Error("Collection not found");
    collectionDetail.isDeleted = false;
    const restoredCollection = await this.updateCollection(collectionDetail);
    return restoredCollection;
  }
}
