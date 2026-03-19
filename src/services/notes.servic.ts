import { NoteRepository } from "../repositories/note.repository";
import { CollectionRepository } from "../repositories/collection.repository";
import { useActionEventStore } from "../stores/useActionEventStore";
import type { PaginatedResult } from "../types/paginated.result";
import type { Note } from "../models/note";

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
    const foundCollection = await CollectionRepository.get(collection);
    if (!foundCollection) throw new Error("Collection not found");
    const result = await NoteRepository.create(note);
    const { register: registerEvent } = useActionEventStore();
    registerEvent("note_created");
    return result;
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
    const foundCollection = await CollectionRepository.get(collection);
    if (!foundCollection) throw new Error("Collection not found");
    return await NoteRepository.update(note);
  }

  static async getNote(id: number): Promise<Note | null> {
    if (!id || id <= 0) return null;
    return await NoteRepository.get(id);
  }

  static async getNotes(
    collection: number = 1, // 1 is default collection
    pageSize: number = 30,
    lastKey: [number, string] | null = null,
    onlyDeleted: boolean = false,
  ): Promise<PaginatedResult<Note>> {
    if (collection && collection <= 0) throw new Error("Invalid collection id");
    if (collection && typeof collection === "number") {
      const foundCollection = await CollectionRepository.get(collection);
      if (!foundCollection) throw new Error("Collection not found");
    }
    return await NoteRepository.getAll(
      collection,
      pageSize,
      lastKey,
      onlyDeleted,
    );
  }

  static async softDeleteNote(id: number) {
    if (!id || id <= 0) throw new Error("Invalid note id");
    await NoteRepository.softDelete(id);
    const { register: registerEvent } = useActionEventStore();
    registerEvent("note_soft_deleted");
  }

  static async deleteNote(id: number) {
    if (!id || id <= 0) throw new Error("Invalid note id");
    await NoteRepository.permanentDelete(id);
    const { register: registerEvent } = useActionEventStore();
    registerEvent("note_hard_deleted");
  }

  static async restoreNote(id: number) {
    if (!id || id <= 0) throw new Error("Invalid note id");
    const note = await NoteRepository.get(id);
    if (!note) throw new Error("Note not found");
    const collection = await CollectionRepository.get(note.collectionId);
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
    return await NoteRepository.restore(note);
  }

  static async getCount(
    collectionId: number,
    onlyDeleted: boolean = false,
  ): Promise<number> {
    const collection = await CollectionRepository.get(collectionId);
    if (!collection) throw new Error("Collection not found");
    return await NoteRepository.getCount(collectionId, onlyDeleted);
  }

  static async clearExpiredNotes() {
    return await NoteRepository.cleanExpiredRecords();
  }
}
