<template>
  <div id="collection-layout">
    <header>
      <h2>Colecciones y notas</h2>
      <p>Cree colecciones personalizadas para guardar sus notas.</p>
    </header>
    <div class="collection-container">
      <CollectionList
        @open-collection-notes="setCurrentCollection"
        @no-collection-selected="currentCollection = null"
      />
    </div>
    <div
      class="current-collection-title"
      v-if="currentCollection && currentCollection.name"
    >
      <h4><ChevronRight /> {{ currentCollection.name }}</h4>
      <button class="btn-primary" @click="openCreateNoteForm()">
        <FilePlusCorner /> Crear nota
      </button>
    </div>

    <div v-if="currentCollection" class="notes-container">
      <NoteBoard
        :collection="currentCollection?.id!"
        @open-form="openEditNoteForm"
        :should-reload="shouldReloadNotes"
      />
    </div>
    <div v-else class="no-current-collection-state">
      <img
        id="no-collection-img"
        src="../assets/svg/no-collection-selected-icon.svg"
        alt="no collection selected"
      />
      <p>Seleccione cualquier colección de la lista para ver sus notas.</p>
    </div>

    <div class="popup-layout" v-if="visibleNoteForm">
      <NoteForm
        v-if="visibleNoteForm"
        :collection="currentCollection?.id!"
        :isTemporary="false"
        :form-mode="formMode"
        @close-form="visibleNoteForm = false"
        :note="selectedNote"
        @should-reload="requestReload"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import CollectionList from "../components/CollectionList.vue";
import NoteBoard from "../components/NoteBoard.vue";
import NoteForm from "../components/NoteForm.vue";
import { ref, watch } from "vue";
import type { Note } from "../models/note";
import type { FormMode } from "../types/form.mode";
import type { Collection } from "../models/collection";
import { FilePlusCorner, ChevronRight } from "lucide-vue-next";
const currentCollection = ref<Collection | null>(null);
const visibleNoteForm = ref(false);
const selectedNote = ref<Note | null>(null);
let formMode: FormMode = "create";
const shouldReloadNotes = ref(false);

function setCurrentCollection(collection: Collection) {
  if (!collection) return;
  currentCollection.value = collection;
}

function openEditNoteForm(note: Note) {
  if (!note) return;
  visibleNoteForm.value = true;
  formMode = "edit";
  selectedNote.value = note;
}

function openCreateNoteForm() {
  visibleNoteForm.value = true;
  formMode = "create";
  selectedNote.value = null;
}

let timer: number | null = null;
function requestReload() {
  shouldReloadNotes.value = true;
}

watch(
  () => shouldReloadNotes.value,
  (newVal) => {
    if (newVal) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        shouldReloadNotes.value = false;
      }, 200);
    }
  },
);
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
#no-collection-img {
  height: 220px;
}
</style>
