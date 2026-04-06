import { DB_NAME } from "./idb";
import { dbPromise } from "../db/idb";

export class IDBManager {
  private static dbName = DB_NAME;

  static async clearDB(): Promise<void> {
    const db = await dbPromise;
    if (db) {
      db.close();
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject();
      request.onblocked = () => {
        console.warn("Database is blocked, close all tabs and try again");
      };
    });
  }
}
