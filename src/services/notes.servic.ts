import { NoteRepository } from "../repositories/note.repository";
import { CollectionRepository } from "../repositories/collection.repository";
import { useActionEventStore } from "../stores/useActionEventStore";
import type { PaginatedResult } from "../types/paginated.result";
import type { Note } from "../models/note";
import type { ResultPattern } from "../types/result.pattern";
import type { GetAllOptsNotes } from "../repositories/note.repository";
import { ok, error, handleErrorMsg } from "../utils/error.helpers";

export class NoteService {
  static async createNote(
    note: Omit<Note, "id">,
  ): Promise<ResultPattern<Note>> {
    try {
      if (!note) throw new Error("Nota inválida");
      if (note.title.length > 100)
        throw new Error("El título es demasiado largo");
      if (
        note.description &&
        (note.description.length > 1000 || note.description.length < 5)
      ) {
        throw new Error("La descripción debe tener entre 5 y 1000 caracteres");
      }
      const collection = note.collectionId || 1;
      const foundCollection = await CollectionRepository.get(collection);
      if (!foundCollection) throw new Error("La colección no existe");
      const result = await NoteRepository.create(note);
      const { register } = useActionEventStore();
      register("note_created");
      return ok(result);
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al crear la nota");
      return error(message);
    }
  }

  static async updateNote(note: Note): Promise<ResultPattern<Note>> {
    try {
      if (!note) throw new Error("Nota inválida");
      if (note.title.length > 100)
        throw new Error("El título es demasiado largo");
      if (
        note.description &&
        (note.description.length > 1000 || note.description.length < 5)
      ) {
        throw new Error("La descripción debe tener entre 5 y 1000 caracteres");
      }
      const collection = note.collectionId || 1;
      const foundCollection = await CollectionRepository.get(collection);
      if (!foundCollection) throw new Error("La colección no existe");
      const updated = await NoteRepository.update(note);
      return ok(updated);
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al actualizar la nota");
      return error(message);
    }
  }

  static async getNote(id: number): Promise<ResultPattern<Note | null>> {
    try {
      if (!id || id <= 0) throw new Error("ID de nota inválido");
      const note = await NoteRepository.get(id);
      return ok(note);
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al obtener la nota");
      return error(message);
    }
  }

  static async getNotes(
    opts: GetAllOptsNotes,
  ): Promise<ResultPattern<PaginatedResult<Note>>> {
    try {
      if (!opts) throw new Error("Opciones inválidas");
      let { collection } = opts;
      collection = collection ?? 1; // 1 is default collection
      if (collection && collection <= 0)
        throw new Error("ID de colección inválido");
      if (collection) {
        const foundCollection = await CollectionRepository.get(collection);
        if (!foundCollection) throw new Error("La colección no existe");
      }
      const result = await NoteRepository.getAll(opts);
      return ok(result);
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al obtener las notas");
      return error(message);
    }
  }

  static async softDeleteNote(id: number): Promise<ResultPattern<void>> {
    try {
      const note = await NoteRepository.get(id);
      if (!note || !id || id <= 0) throw new Error("ID de nota inválido");
      await NoteRepository.softDelete(id);
      const collection = await CollectionRepository.get(note.collectionId);
      if (!collection) throw new Error("Colección no encontrada");
      collection.hasDeletedNotes = true;
      await CollectionRepository.update(collection);
      const { register } = useActionEventStore();
      register("note_soft_deleted");
      return ok();
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al eliminar la nota");
      return error(message);
    }
  }

  static async deleteNote(id: number): Promise<ResultPattern<void>> {
    try {
      if (!id || id <= 0) throw new Error("ID de nota inválido");
      await NoteRepository.permanentDelete(id);
      const { register } = useActionEventStore();
      register("note_hard_deleted");
      return ok();
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al eliminar permanentemente");
      return error(message);
    }
  }

  static async restoreNote(id: number): Promise<ResultPattern<Note>> {
    try {
      if (!id || id <= 0) throw new Error("ID de nota inválido");
      const note = await NoteRepository.get(id);
      if (!note) throw new Error("La nota no existe");
      const collection = await CollectionRepository.get(note.collectionId);
      if (!collection) {
        note.collectionId = 1;
      }
      if (note.collectionId === 2 && note.expiresAt) {
        const now = new Date();
        const expiration = new Date(note.expiresAt);
        if (expiration < now) {
          note.collectionId = 1;
        }
      }
      await NoteRepository.restore(note);
      const collectionDeletedCount = await NoteRepository.getCount(
        note.collectionId,
        true,
      );
      let targetCollection = await CollectionRepository.get(note.collectionId);
      if (targetCollection) {
        targetCollection.hasDeletedNotes = collectionDeletedCount > 0;
        await CollectionRepository.update(targetCollection);
      }
      return ok();
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al restaurar la nota");
      return error(message);
    }
  }

  static async getCount(
    collectionId: number,
    onlyDeleted: boolean = false,
  ): Promise<ResultPattern<number>> {
    try {
      const collection = await CollectionRepository.get(collectionId);
      if (!collection) throw new Error("La colección no existe");
      const count = await NoteRepository.getCount(collectionId, onlyDeleted);
      return ok(count);
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(
        err,
        "Error al obtener el conteo de notas",
      );
      return error(message);
    }
  }

  static async clearExpiredNotes(): Promise<ResultPattern<void>> {
    try {
      await NoteRepository.cleanExpiredRecords();
      return ok();
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al limpiar notas expiradas");
      return error(message);
    }
  }

  static async moveNoteToCollection(noteId: number, collectionId: number) {
    try {
      if (!noteId || noteId <= 0) throw new Error("ID de nota inválido");
      if (!collectionId || collectionId <= 0)
        throw new Error("ID de colección inválido");
      const note = await NoteRepository.get(noteId);
      if (!note) throw new Error("Nota no encontrada");
      const collection = await CollectionRepository.get(collectionId);
      if (!collection) throw new Error("Colección no encontrada");
      note.collectionId = collectionId;
      await NoteRepository.update(note);
      const { register } = useActionEventStore();
      register("note_moved");
      return ok();
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(
        err,
        "Error al mover la nota a la colección",
      );
      return error(message);
    }
  }
}
