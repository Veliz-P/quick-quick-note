<template>
  <section class="settings-section">
    <h3>Apariencia <Palette /></h3>
    <p>
      Cambia el tema de la aplicación y selecciona un set de colores a tu gusto.
    </p>
    <ul class="options-list">
      <li>
        <h4>Tema principal</h4>
        <div class="theme-options">
          <div
            @click="setTheme('light')"
            class="theme-option light-theme"
            :class="themeMode === 'light' ? 'active-setting' : ''"
          >
            <div>
              <Sun :stroke-width="1.5" :size="30" />
            </div>
            <p>Modo claro</p>
          </div>
          <div
            @click="setTheme('dark')"
            class="theme-option dark-theme"
            :class="themeMode === 'dark' ? 'active-setting' : ''"
          >
            <div>
              <Moon :stroke-width="1.5" :size="30" />
            </div>
            <p>Modo oscuro</p>
          </div>
        </div>
      </li>
      <li>
        <h4>Colores de acento</h4>
        <div>
          <ul class="accent-color-sets">
            <li
              class="color-set"
              v-for="key in Object.keys(availableColorSets)"
              :key="key"
              @click="setColorSet(key as ColorSetKey)"
            >
              <div
                class="color"
                v-for="color in getColorSet(key)"
                :style="{ backgroundColor: color }"
              ></div>
              <input
                type="radio"
                name="color-set"
                :value="key"
                :checked="key === colorSetKey"
              />
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { Sun, Moon, Palette } from "lucide-vue-next";
import { useThemeSettingsStore } from "../stores/useThemeSettingsStore";
import { availableColorSets } from "../stores/useThemeSettingsStore";
import type { ColorSetKey, Theme } from "../stores/useThemeSettingsStore";
const themeSettings = useThemeSettingsStore();
const themeMode = ref<Theme>("light");
const colorSetKey = ref<ColorSetKey>("a");
const reloadSettings = defineModel("reloadSettings", {
  default: false,
});
watch(reloadSettings, (newVal) => {
  if (newVal) {
    loadSettings();
  }
});
function getColorSet(key: string) {
  return availableColorSets[key as keyof typeof availableColorSets];
}

function setTheme(theme: Theme) {
  themeMode.value = theme;
  themeSettings.setTheme(theme);
}

function setColorSet(key: ColorSetKey) {
  colorSetKey.value = key;
  themeSettings.setColorSetKey(key);
}

function loadSettings() {
  themeMode.value = themeSettings.getTheme();
  colorSetKey.value = themeSettings.getColorSetKey();
}
onMounted(() => {
  loadSettings();
});
</script>
<style scoped>
.theme-options {
  display: flex;
  gap: var(--space-8);
}
.theme-option {
  display: flex;
  width: 150px;
  flex-direction: column;
  align-items: end;
  gap: var(--space-2);
  cursor: pointer;
  background-color: var(--bg);
  padding: var(--space-4);
  border-radius: var(--rounded-xl);
  border: 2px solid var(--border);
}
.theme-option:hover {
  border-color: var(--secondary-300);
}
.theme-option > div:first-child {
  border-radius: var(--rounded-lg);
  display: flex;
  justify-content: end;
  padding: var(--space-3);
  padding-top: var(--space-2);
  padding-bottom: var(--space-2);
}
.theme-option p {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  padding-left: var(--space-1);
}
.dark .light-theme > div {
  background-color: var(--light);
  color: var(--dark);
}
.dark-theme > div {
  background-color: var(--dark);
  color: var(--light);
}
.dark .dark-theme > div {
  background-color: var(--bg);
  color: var(--text-muted);
}
.accent-color-sets {
  list-style: none;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--space-4);
}
.color-set {
  display: flex;
  gap: var(--space-2);
  text-transform: capitalize;
  background-color: var(--bg);
  padding: var(--space-4);
  border-radius: var(--rounded-xl);
  border: 2px solid var(--border);
}
.color-set input {
  width: 18px;
  margin-left: var(--space-4);
}
.color {
  width: 25px;
  height: 25px;
  border-radius: var(--rounded-full);
}
</style>
