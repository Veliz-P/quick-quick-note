import { defineStore } from "pinia";
import { ref } from "vue";

interface RecycleBinSettings {
  enableRecycleBin: boolean;
  recycleBinDuration: number;
}

export const useRecycleBinSettings = defineStore(
  "recycleBinSettings",
  () => {
    const recycleBinSettings = ref<RecycleBinSettings>({
      enableRecycleBin: true,
      recycleBinDuration: 30, // days
    });

    function toggleEnableRecycleBin() {
      recycleBinSettings.value.enableRecycleBin =
        !recycleBinSettings.value.enableRecycleBin;
    }
    function getEnableRecycleBin() {
      return recycleBinSettings.value.enableRecycleBin;
    }
    function setRecycleBinDuration(value: number) {
      recycleBinSettings.value.recycleBinDuration = value;
    }
    function getRecycleBinDuration() {
      return recycleBinSettings.value.recycleBinDuration;
    }
    return {
      recycleBinSettings,
      toggleEnableRecycleBin,
      getEnableRecycleBin,
      setRecycleBinDuration,
      getRecycleBinDuration,
    };
  },
  {
    persist: {
      storage: localStorage,
    },
  },
);
