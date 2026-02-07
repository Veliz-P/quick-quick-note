import type { DefaultStores } from "../db/idb";

export interface Note {
  id?: number;
  title: string;
  description?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface DeletedNote extends Note {
  originalCollection: number | DefaultStores;
  deletedAt: string;
  originalId: number;
}
