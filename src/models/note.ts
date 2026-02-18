export interface Note {
  id?: number | null;
  collectionId: number;
  title: string;
  description?: string;
  createdAt: string;
  expiresAt?: string;
  isDeleted: boolean;
}
