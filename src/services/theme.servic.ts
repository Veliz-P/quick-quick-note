export type Theme = "light" | "dark";

export class ThemeService {
  static checkConfig() {
    const currentTheme = this.getTheme();
    if (!currentTheme) {
      const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      this.setTheme(prefersDarkMode ? "dark" : "light");
      return;
    }
    this.setTheme(currentTheme as Theme);
  }
  static setTheme(theme: Theme) {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }

  static getTheme(): Theme | null {
    const theme = localStorage.getItem("theme");
    if (!theme) return null;
    if (theme && theme !== "light" && theme !== "dark") return null;
    return localStorage.getItem("theme") as Theme;
  }
}
