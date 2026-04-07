<template>
  <div id="collection-layout">
    <header v-if="!trash">
      <h2>Colecciones y notas</h2>
      <p>Cree colecciones personalizadas para guardar sus notas.</p>
    </header>
    <header v-else>
      <h2>Papelera de reciclaje</h2>
      <p>Aquí encontrarás tus colecciones y notas eliminadas.</p>
    </header>
    <div class="collection-container">
      <CollectionList
        :trash="trash"
        v-model:current-collection="currentCollection"
        v-model:collections-length="collectionsLength"
      />
    </div>
    <div
      class="current-collection-title"
      v-if="currentCollection && currentCollection.name"
    >
      <h4>
        <ChevronRight /> {{ formatCollectionName(currentCollection.name) }}
      </h4>
      <div v-if="!trash">
        <button
          v-if="canCreateMoreNotes"
          class="btn-primary"
          @click="openCreateNoteForm()"
        >
          <FilePlusCorner /> Crear nota
        </button>
        <p class="max-limit-info" v-else>
          Colección llena ({{ currentCollection.currentSize }}/{{
            currentCollection.maxSize
          }})
        </p>
      </div>
    </div>
    <div v-if="currentCollection" class="notes-container">
      <NoteBoard
        :only-deleted="trash"
        :collection="currentCollection?.id!"
        :can-create-more-notes="canCreateMoreNotes"
        @refresh-collection="refreshCollection"
      />
    </div>
    <div
      v-if="collectionsLength > 0 && !currentCollection"
      class="no-current-collection-state"
    >
      <img
        id="no-collection-img"
        src="../assets/svg/no-collection-selected-icon.svg"
        alt="no collection selected"
      />
      <p>Seleccione cualquier colección de la lista para ver sus notas.</p>
    </div>
    <div
      v-if="collectionsLength === 0 && !currentCollection && trash"
      class="no-current-collection-state"
    >
      <img
        id="no-trash-img"
        src="../assets/svg/no-trash.svg"
        alt="no collection selected"
      />
      <p>Vaya, parece que la papelera de reciclaje está limpia.</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onBeforeMount, computed } from "vue";
import { storeToRefs } from "pinia";
import CollectionList from "../components/CollectionList.vue";
import NoteBoard from "../components/NoteBoard.vue";
import { FilePlusCorner, ChevronRight } from "lucide-vue-next";
import { useNoteFormStore } from "../stores/useNoteFormStore";
import { useRoute } from "vue-router";
import type { Collection } from "../models/collection";
import type { NoteFormStoreOptions } from "../types/note.form.options";
import { CollectionService } from "../services/collection.servic";

const trash = ref(false);
const currentCollection = ref<Collection | null>(null);
const collectionsLength = ref(0);
const { openForm } = useNoteFormStore();
const { shouldReload } = storeToRefs(useNoteFormStore());
const route = useRoute();

async function refreshCollection() {
  if (!currentCollection.value) return;
  const id = currentCollection.value.id!;
  const refreshResult = await CollectionService.getCollection(id);
  if (!refreshResult.success || !refreshResult.data) return;
  currentCollection.value = refreshResult.data;
}

watch(shouldReload, async () => {
  await refreshCollection();
});

function openCreateNoteForm() {
  const opts: NoteFormStoreOptions = {
    isTemporary: currentCollection.value?.id === 2,
    note: null,
    collectionId: currentCollection.value?.id!,
    formMode: "create",
  };
  openForm(opts);
}

function formatCollectionName(collectionName: string) {
  if (trash) {
    collectionName = collectionName.split(":")[0] || collectionName;
  }
  return collectionName;
}

const canCreateMoreNotes = computed(() => {
  if (!currentCollection.value) return false;
  return currentCollection.value.currentSize < currentCollection.value.maxSize;
});

watch(
  () => route.query.trash,
  (paramChanged) => {
    trash.value = paramChanged === "true" ? true : false;
    currentCollection.value = null;
  },
);
onBeforeMount(() => {
  trash.value = route.query.trash === "true" ? true : false;

  console.log(trash.value);
  console.log(currentCollection.value);
  console.log(collectionsLength.value);
});
</script>

<style scoped>
#collection-layout {
  display: flex;
  flex-direction: column;
}
h2 {
  font-size: var(--fs-xl);
  margin-bottom: var(--space-1);
}
h2 + p {
  color: var(--text-muted);
  margin-bottom: var(--space-8);
}

.collection-container {
  margin-bottom: var(--space-6);
}

.current-collection-title {
  margin-bottom: var(--space-8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.current-collection-title h4 {
  font-size: var(--fs-md);
  text-transform: capitalize;
  color: var(--text-muted);
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  width: 80%;
  word-break: break-all;
}

.no-current-collection-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
}
#no-collection-img,
#no-trash-img {
  height: 220px;
}
.max-limit-info {
  font-size: var(--fs-sm);
  color: var(--info-800);
  background-color: var(--info-200);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--rounded-md);
  font-weight: bold;
}
.dark .max-limit-info {
  background-color: var(--info-800);
  color: var(--info-200);
}
</style>
