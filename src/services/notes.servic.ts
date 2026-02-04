import type { Note, DeletedNote } from "../models/note";
import { CollectionService } from "./collection.servic";
import { dbPromise } from "../db/idb";
import { defaultStores } from "../db/idb";
import type { DefaultStores } from "../db/idb";
import type { PaginatedResult } from "../types/paginated.result";

export class NoteService {
  static async createNote(
    note: Omit<Note, "id">,
    collection: number | DefaultStores = defaultStores.DEFAULT_NOTES,
  ): Promise<Note> {
    if (!note) throw new Error("Invalid note");
    if (note.title.length > 100) throw new Error("Title too long");
    if (
      note.description &&
      (note.description.length > 1000 || note.description.length < 5)
    )
      throw new Error("Description invalid, must be between 5 and 1000 chars");
    const db = await dbPromise;
    if (collection && typeof collection === "number") {
      const foundCollection = await CollectionService.getCollection(collection);
      if (!foundCollection) throw new Error("Collection not found");
    }
    note.createdAt = new Date().toISOString();
    const id = await db.add(String(collection), note);
    return {
      id: Number(id),
      ...note,
    };
  }

  static async updateNote(
    note: Note,
    collection: number | DefaultStores = defaultStores.DEFAULT_NOTES,
  ): Promise<Note> {
    if (!note) throw new Error("Invalid note");
    if (note.title.length > 100) throw new Error("Title too long");
    if (
      note.description &&
      (note.description.length > 1000 || note.description.length < 5)
    )
      throw new Error("Description invalid, must be between 5 and 1000 chars");
    const db = await dbPromise;
    if (collection && typeof collection === "number") {
      const foundCollection = await CollectionService.getCollection(collection);
      if (!foundCollection) throw new Error("Collection not found");
    }
    await db.put(String(collection), note);
    return note;
  }

  static async getNote(
    id: number,
    collection: number | DefaultStores = defaultStores.DEFAULT_NOTES,
  ): Promise<Note | DeletedNote | null> {
    if (!id || id <= 0) return null;
    const db = await dbPromise;
    const note = await db.get(String(collection), id);
    if (!note) return null;
    return note;
  }

  static async getNotes(
    collection: number | DefaultStores = defaultStores.DEFAULT_NOTES,
    lastKey?: number,
    pageSize: number = 30,
  ): Promise<PaginatedResult<Note> | PaginatedResult<DeletedNote>> {
    if (collection && typeof collection === "number" && collection <= 0)
      throw new Error("Invalid collection id");
    const db = await dbPromise;
    if (collection && typeof collection === "number") {
      const foundCollection = await CollectionService.getCollection(collection);
      if (!foundCollection) throw new Error("Collection not found");
    }
    const tx = db.transaction(String(collection), "readonly");
    const store = tx.objectStore(String(collection));
    let notes: Note[] | DeletedNote[] = [];
    let newLastKey: number | null = null;
    let cursor = lastKey
      ? await store.openCursor(IDBKeyRange.lowerBound(lastKey, true))
      : await store.openCursor();
    while (cursor && notes.length < pageSize) {
      notes.push(cursor.value);
      newLastKey = Number(cursor.key) || null;
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

  static async softDeleteNote(
    id: number,
    collection: number | DefaultStores = defaultStores.DEFAULT_NOTES,
  ) {
    if (!id || id <= 0) throw new Error("Invalid note id");
    if (collection && typeof collection === "number" && collection <= 0)
      throw new Error("Invalid collection id");
    const note = await this.getNote(id, collection);
    if (!note) throw new Error("Note not found");

    const deletedNote: Omit<DeletedNote, "id"> = {
      title: note.title,
      description: note.description,
      createdAt: note.createdAt,
      expiresAt: note.expiresAt,
      originalCollection: collection,
      originalId: note.id,
      deletedAt: new Date().toISOString(),
    };

    const db = await dbPromise;
    const tx = db.transaction(
      [String(collection), defaultStores.GARBAGE_NOTES],
      "readwrite",
    );
    await tx.objectStore(String(collection)).delete(id);
    await tx.objectStore(defaultStores.GARBAGE_NOTES).add(deletedNote);
  }

  static async deleteNote(
    id: number,
    collection: number | DefaultStores = defaultStores.DEFAULT_NOTES,
  ) {
    if (!id || id <= 0) throw new Error("Invalid note id");
    if (collection && typeof collection === "number" && collection <= 0)
      throw new Error("Invalid collection id");
    const note = await this.getNote(id, collection);
    if (!note) throw new Error("Note not found");

    const db = await dbPromise;
    await db.delete(String(collection), id);
  }

  static async restoreNote(id: number) {
    if (!id || id <= 0) throw new Error("Invalid note id");
    const note = (await this.getNote(
      id,
      defaultStores.GARBAGE_NOTES,
    )) as DeletedNote;
    if (!note) throw new Error("Note not found");
    const db = await dbPromise;
    const tx = db.transaction(
      [defaultStores.GARBAGE_NOTES, String(note.originalCollection)],
      "readwrite",
    );
    await tx.objectStore(defaultStores.GARBAGE_NOTES).delete(note.id);
    const formatedNote: Note = {
      id: note.originalId,
      title: note.title,
      description: note.description,
      createdAt: note.createdAt,
      expiresAt: note.expiresAt,
    };
    const originalCollection: number | DefaultStores = note.originalCollection;
    if (typeof originalCollection === "number") {
      const foundCollection =
        await CollectionService.getCollection(originalCollection);
      if (!foundCollection) {
        // when collection not found, redirect to default notes collection
        await tx.objectStore(defaultStores.DEFAULT_NOTES).add(formatedNote);
        return;
      }
    }
    await tx.objectStore(String(originalCollection)).add(formatedNote);
    await tx.done;
  }
}
