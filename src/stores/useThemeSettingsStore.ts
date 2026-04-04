import { defineStore } from "pinia";
import { ref } from "vue";

export type Theme = "light" | "dark";
interface ThemeSettings {
  theme: Theme;
  themeChanged: boolean;
  colorSetKey: ColorSetKey;
}
export const availableColorSets = {
  a: ["#6366F1", "#10B981", "#F59E0B", "#F43F5E", "#64748B"],
  b: ["#3B82F6", "#06B6D4", "#22C55E", "#A855F7", "#0EA5E9"],
  c: ["#EF4444", "#F97316", "#EAB308", "#84CC16", "#14B8A6"],
} as const;
export type ColorSet =
  (typeof availableColorSets)[keyof typeof availableColorSets];
export type ColorSetKey = keyof typeof availableColorSets;

export const useThemeSettingsStore = defineStore(
  "themeSettings",
  () => {
    const themeSettings = ref<ThemeSettings>({
      theme: "light",
      themeChanged: false,
      colorSetKey: "a",
    });
    function setTheme(newTheme: Theme) {
      themeSettings.value.theme = newTheme;
      themeSettings.value.themeChanged = true;
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
    function getTheme(): Theme {
      return themeSettings.value.theme || "light";
    }
    function setColorSetKey(newColorSetKey: ColorSetKey) {
      themeSettings.value.colorSetKey = newColorSetKey;
    }
    function getColorSetKey(): ColorSetKey {
      return themeSettings.value.colorSetKey || "a";
    }
    function getColorSet(): ColorSet {
      const key = getColorSetKey();
      return availableColorSets[key] || availableColorSets.a;
    }
    function loadThemeConfig() {
      const currentTheme = getTheme();
      if (!themeSettings.value.themeChanged) {
        const darkMode = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setTheme(darkMode ? "dark" : "light");
        return;
      }
      setTheme(currentTheme);
    }
    function getRandomColor() {
      const colorSet = getColorSet();
      return (
        colorSet[Math.floor(Math.random() * colorSet.length)] ||
        availableColorSets.a[0]
      );
    }
    function resetToDefault() {
      themeSettings.value = {
        theme: "light",
        themeChanged: false,
        colorSetKey: "a",
      };
      loadThemeConfig();
    }
    return {
      themeSettings,
      setTheme,
      getTheme,
      setColorSetKey,
      getColorSetKey,
      loadThemeConfig,
      getColorSet,
      getRandomColor,
      resetToDefault,
    };
  },
  {
    persist: {
      storage: localStorage,
    },
  },
);
