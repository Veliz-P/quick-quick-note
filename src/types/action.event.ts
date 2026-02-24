export type ActionEventType =
  | "note_created"
  | "note_soft_deleted"
  | "note_hard_deleted"
  | "collection_created"
  | "collection_soft_deleted"
  | "collection_hard_deleted";

export interface ActionEvent {
  type: ActionEventType;
  timestamp: string; //ISO 8601
  textContent: string;
}
