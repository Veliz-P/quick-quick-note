<template>
  <div id="settings-layout">
    <header>
      <h2>Ajustes</h2>
      <p>Personalice su experiencia con la app.</p>
    </header>

    <section id="settings">
      <nav>
        <ul id="settings-menu">
          <li>
            <Palette class="setting-icon" :stroke-width="1.5" /> Apariencia
          </li>
          <li><Lock class="setting-icon" :stroke-width="1.5" /> Permisos</li>
          <li>
            <NotepadText class="setting-icon" :stroke-width="1.5" /> Notas
          </li>
          <li>
            <Folder class="setting-icon" :stroke-width="1.5" /> Colecciones
          </li>
          <li>
            <AlertTriangle class="setting-icon" :stroke-width="1.5" /> Zona de
            peligro
          </li>
        </ul>
      </nav>
      <section id="settings-content">
        <section class="settings-section">
          <h3>Apariencia <Palette /></h3>
          <p>
            Cambia el tema de la aplicación y selecciona un set de colores a tu
            gusto.
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
                    <p>{{ key }}</p>
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
        <section class="settings-section">
          <h3>Permisos <Lock /></h3>
          <p>Administra los permisos de la app</p>
        </section>
        <section class="settings-section">
          <h3>Notas <NotepadText /></h3>
          <p>Ajusta el comportamiento de tus notas.</p>
        </section>
        <section class="settings-section">
          <h3>Colecciones <Folder /></h3>
          <p>Ajusta el comportamiento de tus colecciones.</p>
        </section>
        <section class="settings-section">
          <h3>Zona de peligro <AlertTriangle /></h3>
          <p>
            Acciones que pueden alterar el funcionamiento de la app o los datos
            de tu cuenta.
          </p>
        </section>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  Palette,
  Lock,
  NotepadText,
  Folder,
  AlertTriangle,
  Sun,
  Moon,
} from "lucide-vue-next";
import { availableColorSets } from "../services/colors.servic";
import { ThemeService } from "../services/theme.servic";
import { ColorService } from "../services/colors.servic";
import type { Theme } from "../services/theme.servic";
import type { ColorSetKey } from "../services/colors.servic";

const themeMode = ref<Theme>("light");
const colorSetKey = ref<ColorSetKey>("a");

function getColorSet(key: string) {
  return availableColorSets[key as keyof typeof availableColorSets];
}

function setTheme(theme: Theme) {
  themeMode.value = theme;
  ThemeService.setTheme(theme);
}

function setColorSet(key: ColorSetKey) {
  colorSetKey.value = key;
  ColorService.setColorSetKey(key);
}

onMounted(() => {
  themeMode.value = ThemeService.getTheme() || "light";
  colorSetKey.value = ColorService.getColorSetKey();
});
</script>

<style scoped>
h2 {
  font-size: var(--fs-xl);
  margin-bottom: var(--space-1);
}
h2 + p {
  color: var(--text-muted);
  margin-bottom: var(--space-8);
}
#settings-layout {
  display: flex;
  flex-direction: column;
}
#settings {
  display: flex;
  gap: var(--space-8);
  position: relative;
  flex-direction: column;
}
#settings-menu {
  position: sticky;
  top: 0;
  list-style: none;
  display: flex;
  gap: var(--space-4);
  font-weight: bold;
  font-size: var(--fs-sm);
  overflow-x: auto;
  padding-bottom: var(--space-2);
}
#settings-menu li {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border-radius: var(--rounded-xl);
  background-color: var(--bg);
  padding: var(--space-1) var(--space-3);
  border: 2px solid var(--border);
  flex-shrink: 0;
}
.setting-icon {
  color: var(--text-muted);
}
#settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  width: 100%;
  max-width: 850px;
}
.settings-section > h3 {
  font-size: var(--fs-md);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}
.settings-section > p {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.options-list {
  list-style: none;
}
.options-list > li {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border);
}
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

@media (min-width: 768px) {
  #settings {
    gap: var(--space-16);
    flex-direction: row;
  }
  #settings-menu {
    flex-direction: column;
    gap: var(--space-12);
  }
  #settings-menu li {
    align-items: center;
    gap: var(--space-2);
    border-color: transparent;
    background-color: transparent;
  }
  .options-list {
    margin-left: var(--space-4);
  }
  .options-list > li {
    flex-direction: row;
    margin-bottom: var(--space-8);
  }
  .accent-color-sets {
    flex-direction: column;
    flex-wrap: nowrap;
  }
}

.active-setting {
  border-color: var(--secondary-300);
}
</style>
