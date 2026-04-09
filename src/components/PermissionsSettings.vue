<template>
  <section class="settings-section">
    <h3>Permisos <Lock /></h3>
    <p>Administra los permisos de la app</p>
    <ul class="options-list">
      <li @click="permissionSettings.setNotifyExpiredNotes(notifyExpiredNotes)">
        <h4>Notificar notas expiradas</h4>
        <ToggleButton v-model:checked="notifyExpiredNotes" />
      </li>
      <li
        @click="permissionSettings.setShowActivityHistory(showActivityHistory)"
      >
        <h4>Habilitar historial de actividad</h4>
        <ToggleButton v-model:checked="showActivityHistory" />
      </li>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { usePermissionSettingsStore } from "../stores/usePermissionSettings";
import { Lock } from "lucide-vue-next";
import ToggleButton from "./ToggleButton.vue";
const permissionSettings = usePermissionSettingsStore();
const showActivityHistory = ref(true);
const notifyExpiredNotes = ref(true);
const reloadSettings = defineModel("reloadSettings", {
  default: false,
});
watch(reloadSettings, (newVal) => {
  if (newVal) {
    loadSettings();
  }
});
function loadSettings() {
  showActivityHistory.value = permissionSettings.getShowActivityHistory();
  notifyExpiredNotes.value = permissionSettings.getNotifyExpiredNotes();
}
onMounted(() => {
  loadSettings();
});
</script>
<style scoped></style>
