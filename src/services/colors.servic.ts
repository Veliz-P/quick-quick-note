export const availableColorSets = {
  a: ["#6366F1", "#10B981", "#F59E0B", "#F43F5E", "#64748B"],

  b: ["#3B82F6", "#06B6D4", "#22C55E", "#A855F7", "#0EA5E9"],

  c: ["#EF4444", "#F97316", "#EAB308", "#84CC16", "#14B8A6"],
} as const;

export type ColorSet =
  (typeof availableColorSets)[keyof typeof availableColorSets];

export class ColorService {
  static getCurrentColorSet(): ColorSet | null {
    const json = localStorage.getItem("cardColors");
    if (!json) {
      return null;
    }
    return JSON.parse(json);
  }

  static changeColorSet(colorSet: ColorSet): void {
    const json = JSON.stringify(colorSet);
    localStorage.setItem("cardColors", json);
  }

  static resetColorSet(): void {
    localStorage.removeItem("cardColors");
    const json = JSON.stringify(availableColorSets.a);
    localStorage.setItem("cardColors", json);
  }

  static getRandomColor(): string {
    const colorSet = this.getCurrentColorSet();
    if (!colorSet) return "#6366F1";
    return colorSet[Math.floor(Math.random() * colorSet.length)] || "#6366F1";
  }
}
