import { CollectionRepository } from "../repositories/collection.repository";
import { useActionEventStore } from "../stores/useActionEventStore";
import type { Collection } from "../models/collection";
import type { PaginatedResult } from "../types/paginated.result";
import type { ResultPattern } from "../types/result.pattern";
import type { GetAllOpts } from "../types/get.all.opts";
import { ok, error, handleErrorMsg } from "../utils/error.helpers";

export class CollectionService {
  static async createCollection(
    collectionName: string,
  ): Promise<ResultPattern<Collection>> {
    try {
      if (
        !collectionName ||
        collectionName.trim().length <= 1 ||
        collectionName.trim().length > 50
      ) {
        throw new Error("Nombre inválido, debe tener entre 2 y 50 caracteres");
      }
      if (await CollectionRepository.exists(collectionName)) {
        throw new Error("Collection already exists");
      }
      const result = await CollectionRepository.create(collectionName);
      const { register } = useActionEventStore();
      register("collection_created");
      return ok(result);
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al crear la colección");
      return error(message);
    }
  }

  static async collectionExists(
    collectionName: string,
    excludeId?: number,
  ): Promise<ResultPattern<boolean>> {
    try {
      const exists = await CollectionRepository.exists(
        collectionName,
        excludeId,
      );
      return ok(exists);
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al verificar la colección");
      return error(message);
    }
  }

  static async updateCollection(
    collection: Collection,
  ): Promise<ResultPattern<Collection>> {
    try {
      if (
        !collection ||
        collection.name.trim().length <= 1 ||
        collection.name.trim().length > 50
      ) {
        throw new Error("Nombre inválido, debe tener entre 2 y 50 caracteres");
      }
      if (!collection.id || collection.id <= 0) {
        throw new Error("ID inválido");
      }
      if (await CollectionRepository.exists(collection.name, collection.id)) {
        throw new Error("La collección ya existe");
      }
      const updated = await CollectionRepository.update(collection);
      return ok(updated);
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al actualizar la colección");
      return error(message);
    }
  }

  static async getCollection(
    idOrName: number | string,
  ): Promise<ResultPattern<Collection | null>> {
    try {
      if (typeof idOrName === "number") {
        if (idOrName <= 0) throw new Error("ID inválido");
      }
      if (typeof idOrName === "string") {
        if (idOrName.trim().length === 0 || idOrName.trim().length > 50)
          throw new Error(
            "Nombre inválido, debe tener entre 2 y 50 caracteres",
          );
      }
      let collection: Collection | null = null;
      if (typeof idOrName === "number") {
        collection = await CollectionRepository.get(idOrName);
      } else if (typeof idOrName === "string") {
        collection = await CollectionRepository.get(idOrName);
      }
      return ok(collection);
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al obtener la colección");
      return error(message);
    }
  }

  static async getCollections(
    // lastKey?: string | null,
    // pageSize: number = 30,
    // onlyDeleted: boolean = false,
    // search: string = "",
    opts: GetAllOpts,
  ): Promise<ResultPattern<PaginatedResult<Collection>>> {
    try {
      const result = await CollectionRepository.getAll(opts);
      return ok(result);
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al obtener las colecciones");
      return error(message);
    }
  }

  static async softDeleteCollection(id: number): Promise<ResultPattern<void>> {
    try {
      if (!id || id <= 0) throw new Error("ID inválido");
      await CollectionRepository.softDelete(id);
      const { register } = useActionEventStore();
      register("collection_soft_deleted");
      return ok();
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al eliminar la colección");
      return error(message);
    }
  }

  static async deleteCollection(id: number): Promise<ResultPattern<void>> {
    try {
      if (!id || id <= 0) throw new Error("ID inválido");
      const collectionDetail = await CollectionRepository.get(id);
      if (!collectionDetail) throw new Error("Collection not found");
      await CollectionRepository.permanentDelete(id);
      const { register } = useActionEventStore();
      register("collection_hard_deleted");
      return ok();
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al eliminar permanentemente");
      return error(message);
    }
  }

  static async restoreCollection(
    id: number,
  ): Promise<ResultPattern<Collection>> {
    try {
      if (!id || id <= 0) throw new Error("ID inválido");
      const collectionDetail = await CollectionRepository.get(id);
      if (!collectionDetail) throw new Error("Collection not found");
      const restored = await CollectionRepository.restore(collectionDetail);
      return ok(restored);
    } catch (err) {
      console.error(err);
      const message = handleErrorMsg(err, "Error al restaurar la colección");
      return error(message);
    }
  }
}
