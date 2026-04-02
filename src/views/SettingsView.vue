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
          <ul class="options-list">
            <li
              @click="
                permissionSettings.setNotifyExpiredNotes(notifyExpiredNotes)
              "
            >
              <h4>Notificar notas expiradas</h4>
              <ToggleButton v-model:checked="notifyExpiredNotes" />
            </li>
            <li
              @click="
                permissionSettings.setShowActivityHistory(showActivityHistory)
              "
            >
              <h4>Habilitar historial de actividad</h4>
              <ToggleButton v-model:checked="showActivityHistory" />
            </li>
          </ul>
        </section>
        <section class="settings-section">
          <h3>Notas <NotepadText /></h3>
          <p>Ajusta el comportamiento de sus notas.</p>
          <ul class="options-list">
            <li>
              <div>
                <h4>Duración predeterminada de notas temporales</h4>
                <p>
                  Las nuevas notas expirarán en:
                  <span style="text-transform: capitalize">
                    {{ expirationDateEstimation }}
                  </span>
                  a las
                  {{ temporaryNotesDuration.hour }}:
                  {{ temporaryNotesDuration.minute }}
                  {{ temporaryNotesDuration.hour > 11 ? "PM" : "AM" }}
                </p>
              </div>
              <div id="time-picker">
                <div>
                  <h5>Días</h5>
                  <button
                    class="btn-secondary"
                    @click="temporaryNotesDuration.days++"
                  >
                    <Plus :size="16" />
                  </button>
                  <input
                    type="text"
                    maxlength="2"
                    v-model="temporaryNotesDuration.days"
                  />
                  <button
                    class="btn-secondary"
                    @click="temporaryNotesDuration.days--"
                  >
                    <Minus :size="16" />
                  </button>
                </div>
                <div id="hour">
                  <h5>Hora</h5>
                  <button
                    class="btn-secondary"
                    @click="temporaryNotesDuration.hour++"
                  >
                    <Plus :size="16" />
                  </button>
                  <input
                    type="text"
                    maxlength="2"
                    v-model="temporaryNotesDuration.hour"
                  />
                  <button
                    class="btn-secondary"
                    @click="temporaryNotesDuration.hour--"
                  >
                    <Minus :size="16" />
                  </button>
                </div>
                <div id="minute">
                  <h5>Minuto</h5>
                  <button
                    class="btn-secondary"
                    @click="temporaryNotesDuration.minute++"
                  >
                    <Plus :size="16" />
                  </button>
                  <input
                    type="text"
                    maxlength="2"
                    v-model="temporaryNotesDuration.minute"
                  />
                  <button
                    class="btn-secondary"
                    @click="temporaryNotesDuration.minute--"
                  >
                    <Minus :size="16" />
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </section>
        <section class="settings-section">
          <h3>Colecciones <Folder /></h3>
          <p>Ajusta el comportamiento de sus colecciones.</p>
          <ul class="options-list">
            <li>
              <div>
                <h4>Nro máximo de notas por colección</h4>
                <p>El límite solo se aplicará a nuevas colecciones.</p>
              </div>
              <div class="input-with-error-div">
                <div style="position: relative">
                  <input
                    class="setting-num-input"
                    type="text"
                    minlength="0"
                    maxlength="4"
                    v-model="maxNotesPerCollection"
                  />
                  <RotateCcw
                    @click="maxNotesPerCollection = previousMaxNotes"
                    :size="21"
                    class="clear-input-icon"
                    role="button"
                    v-if="invalidNotesPerColl"
                  />
                </div>
                <span class="setting-error" v-if="invalidNotesPerColl"
                  >El nro debe estar entre {{ MIN_NOTES_PER_COLLECTION }} y
                  {{ MAX_NOTES_PER_COLLECTION }}</span
                >
              </div>
            </li>
          </ul>
        </section>
        <section class="settings-section">
          <h3>Papelera de reciclaje <Trash /></h3>
          <p>Decida cómo se eliminan sus notas y colecciones.</p>
          <ul class="options-list">
            <li>
              <div>
                <h4>Habilitar papelera de reciclaje</h4>
                <p class="warning-text">
                  Esta opción puede alterar la recuperación de notas y
                  colecciones
                </p>
              </div>
              <div @click="openRecyclingBinConfirmation">
                <ToggleButton v-model:checked="enableRecycleBin" />
              </div>
            </li>
            <li>
              <h4>Días de duración de la papelera</h4>
              <div class="input-with-error-div">
                <div style="position: relative">
                  <input
                    class="setting-num-input"
                    type="text"
                    minlength="1"
                    maxlength="2"
                    v-model="recycleBinDuration"
                  />
                  <RotateCcw
                    @click="recycleBinDuration = previousRecycleBinDuration"
                    :size="21"
                    class="clear-input-icon"
                    role="button"
                    v-if="invalidRecycleBinDuration"
                  />
                </div>
                <span class="setting-error" v-if="invalidRecycleBinDuration"
                  >El nro debe estar entre {{ MIN_RECYCLE_BIN_DURATION }} y
                  {{ MAX_RECYCLE_BIN_DURATION }}</span
                >
              </div>
            </li>
          </ul>
        </section>
        <section class="settings-section danger-zone">
          <h3>Zona de peligro <AlertTriangle /></h3>
          <p>
            Acciones que pueden alterar el funcionamiento de la app o los datos
            de su cuenta.
          </p>
          <div class="danger-options">
            <button class="btn-danger">Restablecer configuraciones</button>
            <button class="btn-danger">Borrar datos</button>
          </div>
        </section>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import {
  Palette,
  Lock,
  NotepadText,
  Folder,
  AlertTriangle,
  Sun,
  Moon,
  Trash,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-vue-next";
import { availableColorSets } from "../stores/useThemeSettingsStore";
import ToggleButton from "../components/ToggleButton.vue";
import { formatDate } from "../utils/date";
import { debounce } from "../utils/debounce";
import { useConfirmationDialogStore } from "../stores/useConfirmationDialogStore";
import { useThemeSettingsStore } from "../stores/useThemeSettingsStore";
import { usePermissionSettingsStore } from "../stores/usePermissionSettings";
import { useNoteSettingsStore } from "../stores/useNoteSettingsStore";
import { useCollectionSettings } from "../stores/useCollectionSettings";
import { useRecycleBinSettings } from "../stores/useRecycleBinSettings";
import type { Theme } from "../stores/useThemeSettingsStore";
import type { ColorSetKey } from "../stores/useThemeSettingsStore";
import type { TemporaryNotesDuration } from "../stores/useNoteSettingsStore";
import type { ConfirmationDialogOptions } from "../types/confirmation.options";

const { confirm } = useConfirmationDialogStore();
const themeSettings = useThemeSettingsStore();
const permissionSettings = usePermissionSettingsStore();
const noteSettings = useNoteSettingsStore();
const collectionSettings = useCollectionSettings();
const recycleBinSettings = useRecycleBinSettings();
const themeMode = ref<Theme>("light");
const colorSetKey = ref<ColorSetKey>("a");
const notifyExpiredNotes = ref(false);
const showActivityHistory = ref(true);
const MIN_NOTES_PER_COLLECTION = 1;
const MAX_NOTES_PER_COLLECTION = 1000;
const DEFAULT_NOTES_PER_COLLECTION = 100;
const maxNotesPerCollection = ref(DEFAULT_NOTES_PER_COLLECTION);
let previousMaxNotes = DEFAULT_NOTES_PER_COLLECTION;
const invalidNotesPerColl = ref(false);
const enableRecycleBin = ref(true);
const MAX_RECYCLE_BIN_DURATION = 60;
const MIN_RECYCLE_BIN_DURATION = 1;
const DEFAULT_RECYCLE_BIN_DURATION = 30;
const recycleBinDuration = ref(DEFAULT_RECYCLE_BIN_DURATION); // days
let previousRecycleBinDuration = DEFAULT_RECYCLE_BIN_DURATION;
const invalidRecycleBinDuration = ref(false);
const temporaryNotesDuration = ref<TemporaryNotesDuration>({
  days: 1,
  hour: 0,
  minute: 0,
});
const MAX_TEMPORARY_NOTES_DAYS = 15;

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

onMounted(() => {
  themeMode.value = themeSettings.getTheme();
  colorSetKey.value = themeSettings.getColorSetKey();
  notifyExpiredNotes.value = permissionSettings.getNotifyExpiredNotes();
  showActivityHistory.value = permissionSettings.getShowActivityHistory();
  temporaryNotesDuration.value = noteSettings.getTemporaryNotesDuration();
  maxNotesPerCollection.value = collectionSettings.getMaxNotesPerCollection();
  previousMaxNotes = maxNotesPerCollection.value;
  enableRecycleBin.value = recycleBinSettings.getEnableRecycleBin();
  recycleBinDuration.value = recycleBinSettings.getRecycleBinDuration();
  previousRecycleBinDuration = recycleBinDuration.value;
});

async function openRecyclingBinConfirmation() {
  if (!enableRecycleBin.value) {
    const opts: ConfirmationDialogOptions = {
      question: "¿Quieres deshabilitar la papelera de reciclaje?",
      description:
        "Si lo deshabilitas las nuevas notas y colecciones no se podrán recuperar.",
      confirmText: "Deshabilitar",
      cancelText: "Cancelar",
    };
    const ok = await confirm(opts);
    if (!ok) {
      enableRecycleBin.value = true;
      return;
    }
  }
  recycleBinSettings.toggleEnableRecycleBin();
}

function sanitizeNumberInput(rawValue: string) {
  const regex = /[^\d/]/g;
  const replacedValue = rawValue.replace(regex, "");
  return isNaN(Number(replacedValue)) ? 0 : Number(replacedValue);
}
watch(
  maxNotesPerCollection,
  debounce((newLimit: number, oldLimit: number) => {
    if (newLimit === oldLimit) return;
    maxNotesPerCollection.value = sanitizeNumberInput(String(newLimit));
    const parsedLimit = maxNotesPerCollection.value;
    if (
      parsedLimit < MIN_NOTES_PER_COLLECTION ||
      parsedLimit > MAX_NOTES_PER_COLLECTION
    ) {
      invalidNotesPerColl.value = true;
      return;
    }
    invalidNotesPerColl.value = false;
    collectionSettings.setMaxNotesPerCollection(parsedLimit);
    previousMaxNotes = parsedLimit;
  }),
);

watch(
  recycleBinDuration,
  debounce((newLimit: number, oldLimit: number) => {
    if (newLimit === oldLimit) return;
    recycleBinDuration.value = sanitizeNumberInput(String(newLimit));
    const parsedLimit = recycleBinDuration.value;
    if (
      parsedLimit < MIN_RECYCLE_BIN_DURATION ||
      parsedLimit > MAX_RECYCLE_BIN_DURATION
    ) {
      invalidRecycleBinDuration.value = true;
      return;
    }
    invalidRecycleBinDuration.value = false;
    recycleBinSettings.setRecycleBinDuration(parsedLimit);
    previousRecycleBinDuration = parsedLimit;
  }),
);

watch(
  () => temporaryNotesDuration.value,
  (newDuration) => {
    const { days, hour, minute } = newDuration;
    temporaryNotesDuration.value.days = sanitizeNumberInput(String(days));
    temporaryNotesDuration.value.hour = sanitizeNumberInput(String(hour));
    temporaryNotesDuration.value.minute = sanitizeNumberInput(String(minute));

    if (hour > 23) {
      temporaryNotesDuration.value.hour = 23;
    } else if (hour < 0) {
      temporaryNotesDuration.value.hour = 0;
    }

    if (minute > 59) {
      temporaryNotesDuration.value.minute = 59;
    } else if (minute < 0) {
      temporaryNotesDuration.value.minute = 0;
    }

    if (days > MAX_TEMPORARY_NOTES_DAYS) {
      temporaryNotesDuration.value.days = MAX_TEMPORARY_NOTES_DAYS;
    } else if (days < 0) {
      temporaryNotesDuration.value.days = 0;
    } else if (days === 0 && hour === 0 && minute === 0) {
      temporaryNotesDuration.value.hour = 23;
      temporaryNotesDuration.value.minute = 59;
    }
    noteSettings.setTemporaryNotesDuration(temporaryNotesDuration.value);
  },
  { deep: true },
);

const expirationDateEstimation = computed(() => {
  const { days, hour, minute } = temporaryNotesDuration.value;
  const now = new Date();
  now.setDate(now.getDate() + days);
  now.setHours(hour, minute);
  return formatDate(now.toISOString());
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
.settings-section > h3,
.danger-zone > h3 {
  font-size: var(--fs-md);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}
.settings-section > p,
.danger-zone > p {
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
.options-list > li > div > h4 + p {
  color: var(--text-muted);
  font-size: var(--fs-sm);
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
.setting-num-input {
  text-align: right;
  background-color: var(--bg);
}
.warning-text {
  color: var(--warning-800) !important;
  background-color: var(--warning-200);
  padding-left: var(--space-2);
  padding-right: var(--space-2);
  border-radius: var(--rounded-lg);
}
.dark .warning-text {
  background-color: var(--warning-800);
  color: var(--warning-200) !important;
}
.danger-zone {
  border: 2px solid var(--error-400);
  padding: var(--space-6);
  border-radius: var(--rounded-xl);
}
.danger-zone > h3 {
  color: var(--error-500);
}
.dark .danger-zone > h3 {
  color: var(--error-400);
}
.danger-options {
  display: flex;
  gap: var(--space-4);
  flex-direction: column;
}
.danger-options .btn-danger {
  margin-right: auto;
}
.setting-error {
  color: var(--error-500);
  font-size: var(--fs-sm);
}

.dark .setting-error {
  color: var(--error-400);
}
.input-with-error-div {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
  max-width: 220px;
}
.clear-input-icon {
  position: absolute;
  top: 50%;
  left: 5%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--primary-500);
}
#time-picker {
  display: flex;
}
#time-picker h5 {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
#time-picker > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  border-right: 2px solid var(--border);
  padding: 0 var(--space-4);
}
#time-picker input {
  width: 40px;
  flex-shrink: 0;
  background-color: var(--bg);
  text-align: center;
}
#time-picker .btn-secondary {
  padding: var(--space-1);
  border-radius: var(--rounded-full);
  margin: var(--space-1) 0;
}
#hour,
#minute {
  border-right: none !important;
}
#hour {
  padding-right: var(--space-2) !important;
}
#minute {
  padding-left: var(--space-2) !important;
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
