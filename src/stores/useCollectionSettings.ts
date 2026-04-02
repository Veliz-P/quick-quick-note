import { defineStore } from "pinia";
import { ref } from "vue";

interface CollectionSettings {
  maxNotesPerCollection: number;
}

export const useCollectionSettings = defineStore(
  "collectionSettings",
  () => {
    const collectionSettings = ref<CollectionSettings>({
      maxNotesPerCollection: 100,
    });
    function setMaxNotesPerCollection(value: number) {
      if (value < 1 || value > 1000) return;
      collectionSettings.value.maxNotesPerCollection = value;
    }
    function getMaxNotesPerCollection() {
      return collectionSettings.value.maxNotesPerCollection;
    }
    return {
      collectionSettings,
      setMaxNotesPerCollection,
      getMaxNotesPerCollection,
    };
  },
  {
    persist: {
      storage: localStorage,
    },
  },
);
