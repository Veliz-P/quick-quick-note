<template>
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
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Folder } from "lucide-vue-next";
import { debounce } from "../utils/debounce";
import { useCollectionSettings } from "../stores/useCollectionSettings";
const collectionSettings = useCollectionSettings();
const MIN_NOTES_PER_COLLECTION = 1;
const MAX_NOTES_PER_COLLECTION = 1000;
const DEFAULT_NOTES_PER_COLLECTION = 100;
const maxNotesPerCollection = ref(DEFAULT_NOTES_PER_COLLECTION);
let previousMaxNotes = DEFAULT_NOTES_PER_COLLECTION;
const invalidNotesPerColl = ref(false);
const reloadSettings = defineModel("reloadSettings", {
  default: false,
});
watch(reloadSettings, (newVal) => {
  if (newVal) {
    loadSettings();
  }
});
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
function loadSettings() {
  maxNotesPerCollection.value = collectionSettings.getMaxNotesPerCollection();
}
onMounted(() => {
  loadSettings();
});
</script>

<style scoped></style>
