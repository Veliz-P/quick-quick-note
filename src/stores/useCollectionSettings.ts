import { defineStore } from "pinia";
import { ref } from "vue";

interface CollectionSettings {
  maxNotesPerCollection: number;
}

export const useCollectionSettings = defineStore(
  "collectionSettings",
  () => {
    const MAX_NOTES_PER_COLLECTION = 100;
    const collectionSettings = ref<CollectionSettings>({
      maxNotesPerCollection: MAX_NOTES_PER_COLLECTION,
    });
    function setMaxNotesPerCollection(value: number) {
      if (value < 1 || value > 1000) return;
      collectionSettings.value.maxNotesPerCollection = value;
    }
    function getMaxNotesPerCollection() {
      return collectionSettings.value.maxNotesPerCollection;
    }
    function resetToDefault() {
      collectionSettings.value = {
        maxNotesPerCollection: MAX_NOTES_PER_COLLECTION,
      };
    }
    return {
      collectionSettings,
      setMaxNotesPerCollection,
      getMaxNotesPerCollection,
      resetToDefault,
    };
  },
  {
    persist: {
      storage: localStorage,
    },
  },
);
