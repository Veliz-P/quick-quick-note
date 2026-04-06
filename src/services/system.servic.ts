import { IDBManager } from "../db/idb.manager";
import type { ResultPattern } from "../types/result.pattern";
import { ok, error, handleErrorMsg } from "../utils/error.helpers";

export class SystemService {
  static async clearData(): Promise<ResultPattern<void>> {
    try {
      await IDBManager.clearDB();
      return ok();
    } catch (err) {
      const errorMsg = handleErrorMsg(
        error,
        "Error al limpiar la base de datos",
      );
      return error(errorMsg);
    }
  }
}
