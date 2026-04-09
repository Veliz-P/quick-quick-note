<template>
  <section class="settings-section">
    <h3>Papelera de reciclaje <Trash /></h3>
    <p>Decida cómo se eliminan sus notas y colecciones.</p>
    <ul class="options-list">
      <li>
        <div>
          <h4>Habilitar papelera de reciclaje</h4>
          <p class="warning-text">
            Esta opción puede alterar la recuperación de notas y colecciones
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
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Trash, RotateCcw } from "lucide-vue-next";
import { useRecycleBinSettings } from "../stores/useRecycleBinSettings";
import { useConfirmationDialogStore } from "../stores/useConfirmationDialogStore";
import { debounce } from "../utils/debounce";
import ToggleButton from "./ToggleButton.vue";
import type { ConfirmationDialogOptions } from "../types/confirmation.options";
const recycleBinSettings = useRecycleBinSettings();
const { confirm } = useConfirmationDialogStore();
const enableRecycleBin = ref(true);
const MAX_RECYCLE_BIN_DURATION = 60;
const MIN_RECYCLE_BIN_DURATION = 1;
const DEFAULT_RECYCLE_BIN_DURATION = 30;
const recycleBinDuration = ref(DEFAULT_RECYCLE_BIN_DURATION); // days
let previousRecycleBinDuration = DEFAULT_RECYCLE_BIN_DURATION;
const invalidRecycleBinDuration = ref(false);
const reloadSettings = defineModel("reloadSettings", {
  default: false,
});
watch(reloadSettings, (newVal) => {
  if (newVal) {
    loadSettings();
  }
});
async function openRecyclingBinConfirmation() {
  if (!enableRecycleBin.value) {
    const opts: ConfirmationDialogOptions = {
      question: "¿Quieres deshabilitar la papelera de reciclaje?",
      description:
        "Si lo deshabilitas las nuevas notas y colecciones no se podrán recuperar.",
      confirmText: "Sí, deshabilitar",
      cancelText: "No, cancelar",
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
function loadSettings() {
  enableRecycleBin.value = recycleBinSettings.getEnableRecycleBin();
  recycleBinDuration.value = recycleBinSettings.getRecycleBinDuration();
}
onMounted(() => {
  loadSettings();
});
</script>
<style scoped>
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
</style>
