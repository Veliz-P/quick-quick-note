<template>
  <div id="home-layout">
    <header>
      <h1>¡Bienvenido de nuevo!</h1>
    </header>
    <section class="home-section">
      <h2>Acciones rápidas</h2>
      <div class="quick-action-btns">
        <button
          class="btn-primary"
          @click="openNoteForm('create', false, defaultStores.DEFAULT_NOTES)"
        >
          <FilePlusCorner /> Crear nota
        </button>
        <button class="btn-secondary"><FolderPlus /> Crear colección</button>
      </div>
    </section>
    <section class="home-section">
      <!-- TODO: Add recent actions-->
      <h2>Actividad reciente</h2>
      <div id="recent-actions-container">
        <ul id="recent-actions-list">
          <li>
            <p class="action-date">20/10/2025</p>
            <p>Ejemplo 1</p>
          </li>
          <li>
            <p class="action-date">21/10/2025</p>
            <p>Ejemplo 2</p>
          </li>
          <li>
            <p class="action-date">22/10/2025</p>
            <p>Ejemplo 3</p>
          </li>
        </ul>
      </div>
    </section>
    <section class="home-section">
      <h2 id="temporary-notes-h2">Notas temporales</h2>
      <p>Cree notas únicas que se desvanecerán cuando usted lo decida.</p>
      <button
        class="btn-secondary"
        @click="openNoteForm('create', true, defaultStores.TEMPORARY_NOTES)"
      >
        <FilePlusCorner /> Crear nota temporal
      </button>
      <div id="temporary-notes-container">
        <NoteBoard
          @open-form="
            openNoteForm('edit', true, defaultStores.TEMPORARY_NOTES, $event)
          "
          :collection="collection"
        />
      </div>
    </section>
  </div>
  <div v-if="visibleNoteForm" id="note-form-container">
    <NoteForm
      @close-form="visibleNoteForm = false"
      :form-mode="formMode"
      :is-temporary="isTemporary"
      :collection="collection"
      :note="note"
    />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { FilePlusCorner, FolderPlus } from "lucide-vue-next";
import type { FormMode } from "../types/form.mode";
import NoteBoard from "../components/NoteBoard.vue";
import type { DefaultStores } from "../db/idb";
import { defaultStores } from "../db/idb";
import NoteForm from "../components/NoteForm.vue";
import type { Note } from "../models/note";

const visibleNoteForm = ref(false);
let formMode: FormMode = "create";
let isTemporary = false;
let collection: number | DefaultStores = defaultStores.TEMPORARY_NOTES;
let note: Note | null = null;

function openNoteForm(
  mode: FormMode,
  isTemporaryNote: boolean,
  noteCollection: number | DefaultStores,
  selectedNote: Note | null = null,
) {
  visibleNoteForm.value = true;
  formMode = mode;
  isTemporary = isTemporaryNote;
  collection = noteCollection;
  note = selectedNote;
}
</script>
<style scoped>
h1 {
  font-size: var(--fs-2xl);
  margin-bottom: var(--space-8);
}

h2 {
  font-size: var(--fs-lg);
  margin-bottom: var(--space-4);
}

#temporary-notes-h2 {
  margin-bottom: var(--space-1);
}

#temporary-notes-h2 + p {
  margin-bottom: var(--space-4);
  color: var(--text-muted);
}

#home-layout {
  display: flex;
  flex-direction: column;
}
.quick-action-btns {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  justify-items: center;
  flex-wrap: wrap;
}

.home-section {
  margin-bottom: var(--space-8);
  width: 100%;
}

.action-date {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

#recent-actions-container {
  background-color: var(--bg);
  padding: var(--space-4);
  border-radius: var(--rounded-md);
  border: 1.5px solid var(--border);
  width: 100%;
  box-shadow: var(--shadow-sm);
}

#recent-actions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  list-style: none;
}

#temporary-notes-container {
  margin-top: var(--space-8);
  margin-bottom: var(--space-16);
}

#note-form-container {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}

@media (min-width: 768px) {
  #recent-actions-container {
    max-width: 650px;
  }
}
</style>
