import { dbPromise } from "../db/idb";
import { defaultStores } from "../db/idb";
import type { CollectionDetail } from "../models/collection.detail";
import type { PaginatedResult } from "../types/paginated.result";
export class CollectionService {
  static async createCollection(
    collectionName: string,
  ): Promise<CollectionDetail> {
    if (!collectionName || collectionName.trim().length <= 1)
      throw new Error("Invalid collection name");

    const db = await dbPromise;
    if (await this.collectionExists(collectionName))
      throw new Error("Collection already exists");

    const newCollectionDetail: Omit<CollectionDetail, "id"> = {
      collectionName,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };
    const id = await db.add(
      defaultStores.COLLECTION_DETAILS,
      newCollectionDetail,
    );
    if (!id) throw new Error("Failed to create collection");

    const store = db.createObjectStore(String(id), {
      keyPath: "id",
      autoIncrement: true,
    });
    if (!store) throw new Error("Failed to create collection");
    store.createIndex("createdAt", "createdAt");

    let parsedId = Number(id);
    return { id: parsedId, ...newCollectionDetail };
  }

  static async collectionExists(
    collectionName: string,
    excludeId?: number,
  ): Promise<boolean> {
    const db = await dbPromise;
    const collectionDetail: CollectionDetail = await db.getFromIndex(
      defaultStores.COLLECTION_DETAILS,
      "collectionName",
      collectionName,
    );
    if (!collectionDetail) return false;
    if (excludeId !== undefined && collectionDetail.id === excludeId) {
      return false;
    }
    return true;
  }

  static async updateCollection(collectionDetail: CollectionDetail) {
    const db = await dbPromise;
    if (!collectionDetail || collectionDetail.collectionName.trim().length <= 1)
      throw new Error("Invalid collection name");
    if (
      await this.collectionExists(
        collectionDetail.collectionName,
        collectionDetail.id,
      )
    )
      throw new Error("Collection already exists");
    const id = await db.put(defaultStores.COLLECTION_DETAILS, collectionDetail);
    if (!id) throw new Error("Failed to update collection");
    return collectionDetail;
  }

  static async getCollection(id: number): Promise<CollectionDetail | null>;
  static async getCollection(
    collectionName: string,
  ): Promise<CollectionDetail | null>;
  static async getCollection(
    idOrName: number | string,
  ): Promise<CollectionDetail | null> {
    const db = await dbPromise;
    if (typeof idOrName === "string" && idOrName.trim().length >= 1) {
      return db.getFromIndex(
        defaultStores.COLLECTION_DETAILS,
        "collectionName",
        idOrName,
      );
    } else if (typeof idOrName === "number" && idOrName > 0) {
      return db.get(defaultStores.COLLECTION_DETAILS, idOrName);
    }
    return null;
  }

  static async getCollections(
    lastkey?: number,
    onlyDeleted: boolean = false,
    pageSize: number = 30,
  ): Promise<PaginatedResult<CollectionDetail>> {
    const db = await dbPromise;
    const tx = db.transaction(defaultStores.COLLECTION_DETAILS, "readonly");
    const store = tx.objectStore(defaultStores.COLLECTION_DETAILS);
    const index = store.index("isDeletedId");
    const range = lastkey
      ? IDBKeyRange.lowerBound([onlyDeleted, lastkey], true)
      : IDBKeyRange.lowerBound([onlyDeleted, 0]);

    let collections: CollectionDetail[] = [];
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
    if (!id || id <= 0) throw new Error("Invalid collection id");
    const db = await dbPromise;
    const collectionDetail = await this.getCollection(id);
    if (!collectionDetail) throw new Error("Collection not found");
    const tx = db.transaction(
      [defaultStores.COLLECTION_DETAILS, String(id)],
      "readwrite",
    );
    await tx.objectStore(defaultStores.COLLECTION_DETAILS).delete(id);
    await tx.objectStore(String(id)).clear();
    await tx.done;
  }

  static async restoreCollection(id: number) {
    if (!id || id <= 0) throw new Error("Invalid collection id");
    const collectionDetail = await this.getCollection(id);
    if (!collectionDetail) throw new Error("Collection not found");
    collectionDetail.isDeleted = false;
    await this.updateCollection(collectionDetail);
  }
}
