export const availableColorSets = {
  a: ["#6366F1", "#10B981", "#F59E0B", "#F43F5E", "#64748B"],

  b: ["#3B82F6", "#06B6D4", "#22C55E", "#A855F7", "#0EA5E9"],

  c: ["#EF4444", "#F97316", "#EAB308", "#84CC16", "#14B8A6"],
} as const;

export type ColorSet =
  (typeof availableColorSets)[keyof typeof availableColorSets];

export type ColorSetKey = keyof typeof availableColorSets;

export class ColorService {
  static checkConfig() {
    const savedKey = localStorage.getItem("colorSetKey");
    if (!savedKey || !availableColorSets[savedKey as ColorSetKey]) {
      localStorage.setItem("colorSetKey", "a");
    }
  }
  static getCurrentColorSet(): ColorSet {
    const savedKey = localStorage.getItem("colorSetKey");
    if (!savedKey || !availableColorSets[savedKey as ColorSetKey]) {
      return availableColorSets.a;
    }
    return availableColorSets[savedKey as ColorSetKey];
  }
  static setColorSetKey(colorSetKey: ColorSetKey) {
    localStorage.setItem("colorSetKey", colorSetKey);
  }
  static getColorSetKey(): ColorSetKey {
    return (localStorage.getItem("colorSetKey") as ColorSetKey) || "a";
  }
  static resetColorSet() {
    localStorage.removeItem("colorSetKey");
    localStorage.setItem("colorSetKey", "a");
  }
  static getRandomColor() {
    const colorSet = this.getCurrentColorSet();
    if (!colorSet) return "#6366F1";
    return colorSet[Math.floor(Math.random() * colorSet.length)] || "#6366F1";
  }
}
