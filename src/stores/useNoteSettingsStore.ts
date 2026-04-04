import { defineStore } from "pinia";
import { ref } from "vue";

export interface TemporaryNotesDuration {
  days: number;
  hour: number;
  minute: number;
}
interface NoteSettings {
  temporaryNotesDuration: TemporaryNotesDuration;
}
export const useNoteSettingsStore = defineStore(
  "noteSettings",
  () => {
    const noteSettings = ref<NoteSettings>({
      temporaryNotesDuration: {
        days: 1,
        hour: 23,
        minute: 59,
      },
    });
    function getTemporaryNotesDuration(): TemporaryNotesDuration {
      return noteSettings.value.temporaryNotesDuration;
    }
    function setTemporaryNotesDuration(opts: TemporaryNotesDuration) {
      const { days, hour, minute } = opts;
      if (hour > 23 || hour < 0) {
        console.warn("Invalid hour value");
        return;
      }
      if (minute > 59 || minute < 0) {
        console.warn("Invalid minute value");
        return;
      }
      if (days > 15 || days < 0) {
        console.warn("Invalid days value");
        return;
      }
      if (days === 0 && hour === 0 && minute === 0) {
        console.warn("Invalid duration value");
        return;
      }
      noteSettings.value.temporaryNotesDuration = opts;
    }
    function resetToDefault() {
      noteSettings.value = {
        temporaryNotesDuration: {
          days: 1,
          hour: 23,
          minute: 59,
        },
      };
    }
    return {
      noteSettings,
      getTemporaryNotesDuration,
      setTemporaryNotesDuration,
      resetToDefault,
    };
  },
  {
    persist: {
      storage: localStorage,
    },
  },
);
