import { defineStore } from "pinia";
import { ref } from "vue";

interface PermissionSettings {
  notifyExpiredNotes: boolean;
  showActivityHistory: boolean;
}
export const usePermissionSettingsStore = defineStore(
  "permissionSettings",
  () => {
    const permissionSettings = ref<PermissionSettings>({
      notifyExpiredNotes: true,
      showActivityHistory: true,
    });
    function setNotifyExpiredNotes(value: boolean) {
      permissionSettings.value.notifyExpiredNotes = value;
    }
    function getNotifyExpiredNotes(): boolean {
      return permissionSettings.value.notifyExpiredNotes;
    }
    function setShowActivityHistory(value: boolean) {
      permissionSettings.value.showActivityHistory = value;
    }
    function getShowActivityHistory(): boolean {
      return permissionSettings.value.showActivityHistory;
    }
    return {
      permissionSettings,
      setNotifyExpiredNotes,
      setShowActivityHistory,
      getNotifyExpiredNotes,
      getShowActivityHistory,
    };
  },
  {
    persist: {
      storage: localStorage,
    },
  },
);
