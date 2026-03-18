import type { Note } from "../models/note";
import type { FormMode } from "../types/form.mode";

export interface NoteFormStoreOptions {
  isTemporary?: boolean;
  note?: Note | null;
  collectionId?: number;
  formMode?: FormMode;
}
