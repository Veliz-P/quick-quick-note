export interface Collection {
  id?: number | null;
  name: string;
  createdAt: string;
  isDeleted: boolean;
  hasDeletedNotes: boolean;
  currentSize: number;
  maxSize: number;
  deletedAt?: string | null;
}
