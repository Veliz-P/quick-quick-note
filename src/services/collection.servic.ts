import { CollectionRepository } from "../repositories/collection.repository";
import { useActionEventStore } from "../stores/useActionEventStore";
const { register: registerEvent } = useActionEventStore();
import type { Collection } from "../models/collection";
import type { PaginatedResult } from "../types/paginated.result";

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
    if (await CollectionRepository.exists(collectionName))
      throw new Error("Collection already exists");
    const result = await CollectionRepository.create(collectionName);
    registerEvent("collection_created");
    return result;
  }

  static async collectionExists(
    collectionName: string,
    excludeId?: number,
  ): Promise<boolean> {
    return await CollectionRepository.exists(collectionName, excludeId);
  }

  static async updateCollection(collection: Collection) {
    if (
      !collection ||
      collection.name.trim().length <= 1 ||
      collection.name.trim().length > 50
    )
      throw new Error("Invalid collection name");
    if (!collection.id || collection.id <= 0)
      throw new Error("Collection id is required");
    if (await CollectionRepository.exists(collection.name, collection.id))
      throw new Error("Collection already exists");
    return await CollectionRepository.update(collection);
  }

  static async getCollection(id: number): Promise<Collection | null>;
  static async getCollection(
    collectionName: string,
  ): Promise<Collection | null>;
  static async getCollection(
    idOrName: number | string,
  ): Promise<Collection | null> {
    if (idOrName && typeof idOrName === "number")
      return await CollectionRepository.get(idOrName);
    if (idOrName && typeof idOrName === "string")
      return await CollectionRepository.get(idOrName);
    return null;
  }

  static async getCollections(
    lastKey?: string | null,
    pageSize: number = 30,
    onlyDeleted: boolean = false,
  ): Promise<PaginatedResult<Collection>> {
    return await CollectionRepository.getAll(lastKey, pageSize, onlyDeleted);
  }

  static async softDeleteCollection(id: number) {
    if (!id || id <= 0) throw new Error("Invalid collection id");
    await CollectionRepository.softDelete(id);
    registerEvent("collection_soft_deleted");
  }

  static async deleteCollection(id: number) {
    // Destructive action !!
    if (!id || id <= 0) throw new Error("Invalid collection id");
    const collectionDetail = await CollectionRepository.get(id);
    if (!collectionDetail) throw new Error("Collection not found");
    await CollectionRepository.permanentDelete(id);
    registerEvent("collection_hard_deleted");
  }

  static async restoreCollection(id: number): Promise<Collection> {
    if (!id || id <= 0) throw new Error("Invalid collection id");
    const collectionDetail = await CollectionRepository.get(id);
    if (!collectionDetail) throw new Error("Collection not found");
    return await CollectionRepository.restore(collectionDetail);
  }
}
