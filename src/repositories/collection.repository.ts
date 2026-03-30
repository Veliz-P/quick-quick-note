import { dbPromise } from "../db/idb";
import { stores } from "../db/idb";
import type { PaginatedResult } from "../types/paginated.result";
import type { Collection } from "../models/collection";
import type { GetAllOpts, FetchLevel } from "../types/get.all.opts";
import type { Note } from "../models/note";

export interface GetAllOptsCollections extends GetAllOpts {
  onlyWithDeletedNotes?: boolean | undefined;
}

export class CollectionRepository {
  static async create(collectionName: string): Promise<Collection> {
    const db = await dbPromise;
    const newCollection: Omit<Collection, "id"> = {
      name: collectionName,
      createdAt: new Date().toISOString(),
      isDeleted: false,
      hasDeletedNotes: false,
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

    // if (collection?.isDeleted) {
    //   return null;
    // }
    return collection;
  }

  private static matchesSearch(
    collection: Collection,
    search: string,
  ): boolean {
    const collectionName = collection.name.toLowerCase();
    return collectionName.includes(search.toLowerCase());
  }

  private static matchesFetchLevel(
    collection: Collection,
    fetchLevel: FetchLevel,
  ) {
    if (fetchLevel === "all") return true;
    if (fetchLevel === "active" && !collection.isDeleted) return true;
    if (fetchLevel === "inactive" && collection.isDeleted) return true;
    return false;
  }

  private static async matchesOnlyWithDeletedNotes(
    collection: Collection,
    onlyWithDeletedNotes: boolean,
  ) {
    if (onlyWithDeletedNotes && !collection.hasDeletedNotes) return false;
    return true;
  }

  static async getAll(
    opts: GetAllOptsCollections,
  ): Promise<PaginatedResult<Collection>> {
    if (!opts) throw new Error("Opciones inválidas");
    let {
      pageSize,
      lastKey,
      search,
      exclude,
      fetchLevel,
      onlyWithDeletedNotes,
    } = opts;
    pageSize = pageSize ?? 30;
    lastKey = (lastKey as string) ?? null;
    search = search ?? "";
    fetchLevel = fetchLevel ?? "active";
    exclude = exclude ?? []; // TODO: Implement exclude id logic
    onlyWithDeletedNotes = onlyWithDeletedNotes ?? false;

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
      let matchesSearch = true;
      if (search && search.length > 0) {
        matchesSearch = this.matchesSearch(cursor.value, search);
      }
      const matchesFetchLevel = this.matchesFetchLevel(
        cursor.value,
        fetchLevel,
      );
      const matchesOnlyWithDeletedNotes =
        await this.matchesOnlyWithDeletedNotes(
          cursor.value,
          onlyWithDeletedNotes,
        );
      if (matchesFetchLevel && matchesSearch && matchesOnlyWithDeletedNotes) {
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
    const db = await dbPromise;
    const tx = db.transaction(stores.NOTES, "readwrite");
    const store = tx.objectStore(stores.NOTES);
    const index = store.index("byCollectionId");
    const collectionId = Number(id);
    let cursor = await index.openCursor(
      IDBKeyRange.bound(
        [collectionId, 0], // collectionId, id
        [collectionId, Infinity],
      ),
    );
    while (cursor) {
      const note = cursor.value as Note;
      await store.put({ ...note, isDeleted: true });
      cursor = await cursor.continue();
    }
    await tx.done;
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
    collection.name = collection.name.split(":")[0] || collection.name;
    const restoredCollection = await this.update(collection);
    return restoredCollection;
  }
}
