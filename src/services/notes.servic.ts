import type { Note } from "../models/note";
import { CollectionService } from "./collection.servic";
import { dbPromise } from "../db/idb";
import type { PaginatedResult } from "../types/paginated.result";
import { stores } from "../db/idb";

export class NoteService {
  static async createNote(note: Omit<Note, "id">): Promise<Note> {
    if (!note) throw new Error("Invalid note");
    if (note.title.length > 100) throw new Error("Title too long");
    if (
      note.description &&
      (note.description.length > 1000 || note.description.length < 5)
    )
      throw new Error("Description invalid, must be between 5 and 1000 chars");

    const collection = note.collectionId || 1; // 1 is default collection id
    const foundCollection = await CollectionService.getCollection(collection);
    if (!foundCollection) throw new Error("Collection not found");

    const db = await dbPromise;
    note.createdAt = new Date().toISOString();
    const id = await db.add(stores.NOTES, note);
    return {
      id: Number(id),
      ...note,
    };
  }

  static async updateNote(note: Note): Promise<Note> {
    if (!note) throw new Error("Invalid note");
    if (note.title.length > 100) throw new Error("Title too long");
    if (
      note.description &&
      (note.description.length > 1000 || note.description.length < 5)
    )
      throw new Error("Description invalid, must be between 5 and 1000 chars");

    const collection = note.collectionId || 1;
    const foundCollection = await CollectionService.getCollection(collection);
    if (!foundCollection) throw new Error("Collection not found");

    const db = await dbPromise;
    await db.put(stores.NOTES, note);
    return note;
  }

  static async getNote(id: number): Promise<Note | null> {
    if (!id || id <= 0) return null;
    const db = await dbPromise;
    const note = await db.get(stores.NOTES, id);
    if (!note) return null;
    return note;
  }

  static async getNotes(
    collection: number = 1, // 1 is default collection
    pageSize: number = 30,
    lastKey: [number, number] | null = null,
    onlyDeleted: boolean = false,
  ): Promise<PaginatedResult<Note>> {
    if (collection && collection <= 0) throw new Error("Invalid collection id");
    const db = await dbPromise;
    if (collection && typeof collection === "number") {
      const foundCollection = await CollectionService.getCollection(collection);
      if (!foundCollection) throw new Error("Collection not found");
    }
    const tx = db.transaction(stores.NOTES, "readonly");
    const store = tx.objectStore(stores.NOTES);
    const index = store.index("byCollectionId");
    let cursor = null;
    if (lastKey) {
      const [lastCollection, lastId] = lastKey;
      const range = IDBKeyRange.bound(
        [lastCollection, lastId],
        [lastCollection, Infinity],
        true, // exlude last key
        false,
      );
      cursor = await index.openCursor(range);
    } else {
      const range = IDBKeyRange.bound([collection, 0], [collection, Infinity]);
      cursor = await index.openCursor(range);
    }

    let notes: Note[] = [];
    let newLastKey: [number, number] | null = null;
    while (cursor && notes.length < pageSize) {
      const note: Note = cursor.value;
      if (note.isDeleted === onlyDeleted) {
        notes.push(note);
        newLastKey = [note.collectionId, note.id!];
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

  static async softDeleteNote(id: number) {
    if (!id || id <= 0) throw new Error("Invalid note id");
    const note = await this.getNote(id);
    if (!note) throw new Error("Note not found");

    note.isDeleted = true;
    await this.updateNote(note);
  }

  static async deleteNote(id: number) {
    if (!id || id <= 0) throw new Error("Invalid note id");
    const note = await this.getNote(id);
    if (!note) throw new Error("Note not found");

    const db = await dbPromise;
    await db.delete(stores.NOTES, id);
  }

  static async restoreNote(id: number) {
    if (!id || id <= 0) throw new Error("Invalid note id");
    const note = await this.getNote(id);
    if (!note) throw new Error("Note not found");
    const collection = await CollectionService.getCollection(note.collectionId);

    if (!collection) {
      note.collectionId = 1; // Move to default when previous collection no longer exists
    }

    if (note.collectionId && note.collectionId === 2 && note.expiresAt) {
      const currentDate = new Date();
      const expirationDate = new Date(note.expiresAt);
      if (expirationDate < currentDate) {
        note.collectionId = 1; // Move to default when temporary note is expired
      }
    }

    note.isDeleted = false;
    await this.updateNote(note);
  }

  static async getCount(
    collectionId: number,
    onlyDeleted: boolean = false,
  ): Promise<number> {
    const collection = await CollectionService.getCollection(collectionId);
    if (!collection) throw new Error("Collection not found");
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
}
