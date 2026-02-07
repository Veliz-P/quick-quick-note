export class ExpirationNoteService {
  private static maxTimeFrame = 24 * 60 * 60 * 1000; // 24 hours

  static getDefaultExpiration(): Date {
    const json = localStorage.getItem("maxTimeFrame");
    const currentDate = Date.now();
    if (!json) return new Date(currentDate + this.maxTimeFrame);
    try {
      const expiration = JSON.parse(json);
      return new Date(currentDate + expiration);
    } catch (error) {
      return new Date(currentDate + this.maxTimeFrame);
    }
  }

  static setMaxTimeFrame(timeFrame: number) {
    if (!timeFrame || timeFrame <= 0) throw new Error("Invalid time frame");
    localStorage.setItem("noteExpiration", JSON.stringify(timeFrame));
  }

  static getMaxTimeFrame(): number {
    const json = localStorage.getItem("maxTimeFrame");
    if (!json) return this.maxTimeFrame;
    try {
      return JSON.parse(json);
    } catch (error) {
      return this.maxTimeFrame;
    }
  }
}
