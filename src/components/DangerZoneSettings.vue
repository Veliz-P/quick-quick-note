<template>
  <section class="settings-section danger-zone">
    <h3>Zona de peligro <AlertTriangle /></h3>
    <p>
      Acciones que pueden alterar el funcionamiento de la app o los datos de su
      cuenta.
    </p>
    <div class="danger-options">
      <button @click="resetAllToDefault" class="btn-danger">
        Restablecer configuraciones
      </button>
      <button @click="resetAllData" class="btn-danger">Borrar datos</button>
    </div>
  </section>
</template>
<script setup lang="ts">
import { AlertTriangle } from "lucide-vue-next";
import { useConfirmationDialogStore } from "../stores/useConfirmationDialogStore";
import { useThemeSettingsStore } from "../stores/useThemeSettingsStore";
import { usePermissionSettingsStore } from "../stores/usePermissionSettings";
import { useNoteSettingsStore } from "../stores/useNoteSettingsStore";
import { useCollectionSettings } from "../stores/useCollectionSettings";
import { useRecycleBinSettings } from "../stores/useRecycleBinSettings";
import { useToastStore } from "../stores/useToastStore";
import { useActionEventStore } from "../stores/useActionEventStore";
import { SystemService } from "../services/system.servic";
import type { ConfirmationDialogOptions } from "../types/confirmation.options";

const { confirm } = useConfirmationDialogStore();
const themeSettings = useThemeSettingsStore();
const permissionSettings = usePermissionSettingsStore();
const noteSettings = useNoteSettingsStore();
const collectionSettings = useCollectionSettings();
const recycleBinSettings = useRecycleBinSettings();
const { showToast } = useToastStore();
const actionEventStore = useActionEventStore();

interface Emits {
  (e: "reloadSettings"): void;
}
const emit = defineEmits<Emits>();

async function resetAllToDefault() {
  const opts: ConfirmationDialogOptions = {
    question:
      "¿Está seguro de restablecer todas las configuraciones a sus valores por defecto?",
    description: "Se eliminarán todas sus preferencias actuales.",
    confirmText: "Sí, restablecer",
    cancelText: "No, cancelar",
  };
  const ok = await confirm(opts);
  if (!ok) return;
  themeSettings.resetToDefault();
  permissionSettings.resetToDefault();
  noteSettings.resetToDefault();
  collectionSettings.resetToDefault();
  recycleBinSettings.resetToDefault();
  emit("reloadSettings");
}

async function resetAllData() {
  const opts: ConfirmationDialogOptions = {
    question: "¿Quieres borrar todos tus datos permanentemente?",
    description:
      "Antes de continuar, asegúrese de cerrar las demás pestañas abiertas de la app.",
    confirmText: "Sí, eliminar",
    cancelText: "No, cancelar",
  };
  const ok = await confirm(opts);
  if (!ok) {
    // enableRecycleBin.value = true;
    return;
  }
  const result = await SystemService.clearData();
  if (!result.success) {
    showToast("error", result.error);
    return;
  }
  showToast("success", "Datos eliminados, reiniciando la app...");
  actionEventStore.clearActions();
  setTimeout(() => {
    window.location.reload();
  }, 1500);
}
</script>
<style scoped>
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
</style>
