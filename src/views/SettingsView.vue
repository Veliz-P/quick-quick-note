<template>
  <div id="settings-layout">
    <header>
      <h2>Ajustes</h2>
      <p>Personalice su experiencia con la app.</p>
    </header>

    <section id="settings">
      <nav>
        <ul id="settings-menu">
          <li @click="scrollToSection('theme-settings')">
            <Palette class="setting-icon" :stroke-width="1.5" /> Apariencia
          </li>
          <li @click="scrollToSection('permission-settings')">
            <Lock class="setting-icon" :stroke-width="1.5" />
            Permisos
          </li>
          <li @click="scrollToSection('note-settings')">
            <NotepadText class="setting-icon" :stroke-width="1.5" /> Notas
          </li>
          <li @click="scrollToSection('collection-settings')">
            <Folder class="setting-icon" :stroke-width="1.5" /> Colecciones
          </li>
          <li @click="scrollToSection('danger-zone-settings')">
            <AlertTriangle class="setting-icon" :stroke-width="1.5" /> Zona de
            peligro
          </li>
        </ul>
      </nav>
      <section id="settings-content">
        <div id="theme-settings">
          <ThemesSettingsSection v-model:reload-settings="reloadSettings" />
        </div>
        <div id="permission-settings">
          <PermissionsSettings v-model:reload-settings="reloadSettings" />
        </div>
        <div id="note-settings">
          <NoteSettings v-model:reload-settings="reloadSettings" />
        </div>
        <div id="collection-settings">
          <CollectionSettings v-model:reload-settings="reloadSettings" />
        </div>
        <div id="recycling-bin-settings">
          <RecyclingBinSettings v-model:reload-settings="reloadSettings" />
        </div>
        <div id="danger-zone-settings">
          <DangerZoneSettings @reload-settings="requestSettingsReload" />
        </div>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Palette,
  Lock,
  NotepadText,
  Folder,
  AlertTriangle,
} from "lucide-vue-next";
import ThemesSettingsSection from "../components/ThemesSettings.vue";
import PermissionsSettings from "../components/PermissionsSettings.vue";
import NoteSettings from "../components/NoteSettings.vue";
import CollectionSettings from "../components/CollectionSettings.vue";
import RecyclingBinSettings from "../components/RecyclingBinSettings.vue";
import DangerZoneSettings from "../components/DangerZoneSettings.vue";
const reloadSettings = ref(false);

function requestSettingsReload() {
  reloadSettings.value = true;
  setTimeout(() => {
    reloadSettings.value = false;
  }, 50);
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
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
::v-deep(.settings-section > h3),
::v-deep(.danger-zone > h3) {
  font-size: var(--fs-md);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}
::v-deep(.settings-section > p),
::v-deep(.danger-zone > p) {
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}
::v-deep(.options-list) {
  list-style: none;
}
::v-deep(.options-list > li) {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border);
}
::v-deep(.options-list > li > div > h4 + p) {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}
::v-deep(.setting-num-input) {
  text-align: right;
  background-color: var(--bg);
}

::v-deep(.setting-error) {
  color: var(--error-500);
  font-size: var(--fs-sm);
}

.dark ::v-deep(.setting-error) {
  color: var(--error-400);
}
::v-deep(.input-with-error-div) {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
  max-width: 220px;
}
::v-deep(.clear-input-icon) {
  position: absolute;
  top: 50%;
  left: 5%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--primary-500);
}

@media (min-width: 979px) {
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
  ::v-deep(.options-list) {
    margin-left: var(--space-4);
  }
  ::v-deep(.options-list > li) {
    flex-direction: row;
    margin-bottom: var(--space-8);
  }
  ::v-deep(.accent-color-sets) {
    flex-direction: column;
    flex-wrap: nowrap;
  }
}
::v-deep(.active-setting) {
  border-color: var(--secondary-300);
}
</style>
