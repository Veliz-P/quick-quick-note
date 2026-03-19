import type { Note } from "../models/note";
import { dbPromise } from "../db/idb";
import type { PaginatedResult } from "../types/paginated.result";
import { stores } from "../db/idb";

export class NoteRepository {
  static async create(note: Omit<Note, "id">): Promise<Note> {
    if (!note) throw new Error("Invalid note");
    const db = await dbPromise;
    note.createdAt = new Date().toISOString();
    const id = await db.add(stores.NOTES, note);
    return {
      id: Number(id),
      ...note,
    };
  }

  static async update(note: Note): Promise<Note> {
    if (!note) throw new Error("Invalid note");
    const db = await dbPromise;
    await db.put(stores.NOTES, note);
    return note;
  }

  static async get(id: number): Promise<Note | null> {
    const db = await dbPromise;
    const note = await db.get(stores.NOTES, id);
    if (!note) return null;
    return note;
  }

  static async getAll(
    collection: number = 1, // 1 is default collection
    pageSize: number = 30,
    lastKey: [number, string] | null = null,
    onlyDeleted: boolean = false,
  ): Promise<PaginatedResult<Note>> {
    const db = await dbPromise;
    const tx = db.transaction(stores.NOTES, "readonly");
    const store = tx.objectStore(stores.NOTES);
    const index = store.index("byCollectionCreated");
    const now = new Date().toISOString();
    let cursor = null;

    if (lastKey) {
      const [lastCollection, lastDate] = lastKey;
      const range = IDBKeyRange.bound(
        [collection, ""],
        [lastCollection, lastDate],
        true,
        true,
      );
      cursor = await index.openCursor(range, "prev");
    } else {
      const range = IDBKeyRange.bound([collection, ""], [collection, now]);
      cursor = await index.openCursor(range, "prev");
    }

    let notes: Note[] = [];
    let newLastKey: [number, string] | null = null;
    while (cursor && notes.length < pageSize) {
      const note: Note = cursor.value;
      if (note.isDeleted === onlyDeleted) {
        notes.push(note);
        newLastKey = [note.collectionId, note.createdAt];
      }
      cursor = await cursor.continue();
    }
    await tx.done;
    return {
      data: notes,
      pageSize,
      lastKey: newLastKey,
      hasMore: newLastKey !== null && notes.length === pageSize,
    };
  }

  static async softDelete(id: number) {
    const note = await this.get(id);
    if (!note) throw new Error("Note not found");
    note.isDeleted = true;
    await this.update(note);
  }

  static async permanentDelete(id: number) {
    const note = await this.get(id);
    if (!note) throw new Error("Note not found");
    const db = await dbPromise;
    await db.delete(stores.NOTES, id);
  }

  static async restore(note: Note) {
    note.isDeleted = false;
    await this.update(note);
  }

  static async getCount(
    collectionId: number,
    onlyDeleted: boolean = false,
  ): Promise<number> {
    const db = await dbPromise;
    const tx = db.transaction(stores.NOTES, "readonly");
    const idx = tx.objectStore(stores.NOTES).index("byCollectionId");
    const range = IDBKeyRange.bound(
      [collectionId, 0],
      [collectionId, Infinity],
    );
    let count = 0;
    let cursor = await idx.openCursor(range);
    while (cursor) {
      const note: Note = cursor.value;
      if (note.isDeleted === onlyDeleted) count++;
      cursor = await cursor.continue();
    }
    await tx.done;
    return count;
  }

  static async cleanExpiredRecords() {
    const db = await dbPromise;
    const tx = db.transaction(stores.NOTES, "readwrite");
    const store = tx.objectStore(stores.NOTES);
    const idx = store.index("byCollectionId");
    const now = new Date();
    const temporaryNotesCollection = 2;
    const range = IDBKeyRange.bound(
      [temporaryNotesCollection, 0],
      [temporaryNotesCollection, Infinity],
    );

    let cursor = await idx.openCursor(range);
    while (cursor) {
      const note: Note = cursor.value;
      if (new Date(note.expiresAt!).getTime() < now.getTime()) {
        await store.delete(note.id!);
      }
      cursor = await cursor.continue();
    }
    await tx.done;
  }
}
