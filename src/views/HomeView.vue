<template>
  <div id="home-layout">
    <header>
      <h1>¡Bienvenido de nuevo!</h1>
    </header>
    <section class="home-section">
      <h2>Acciones rápidas</h2>
      <div class="quick-action-btns">
        <button class="btn-primary" @click="openNoteForm('create', false, 1)">
          <FilePlusCorner /> Crear nota
        </button>
        <button class="btn-secondary" @click="visibleNewCollectionForm = true">
          <FolderPlus /> Crear colección
        </button>
      </div>
    </section>
    <section
      class="home-section"
      v-if="permissionSettings.getShowActivityHistory()"
    >
      <RecentActivity />
    </section>
    <section class="home-section">
      <h2 id="temporary-notes-h2">Notas temporales</h2>
      <p>Cree notas únicas que se desvanecerán cuando usted lo decida.</p>
      <button class="btn-secondary" @click="openNoteForm('create', true, 2)">
        <FilePlusCorner /> Crear nota temporal
      </button>
      <div id="temporary-notes-container">
        <NoteBoard :collection="collection" />
      </div>
    </section>
  </div>

  <div id="new-collection-form-container" v-if="visibleNewCollectionForm">
    <NewCollectionForm @close-form="visibleNewCollectionForm = false" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { FilePlusCorner, FolderPlus } from "lucide-vue-next";
import { NoteService } from "../services/notes.servic";
import NoteBoard from "../components/NoteBoard.vue";
import RecentActivity from "../components/RecentActivity.vue";
import NewCollectionForm from "../components/CollectionForm.vue";
import { useNoteFormStore } from "../stores/useNoteFormStore";
import { useToastStore } from "../stores/useToastStore";
import { usePermissionSettingsStore } from "../stores/usePermissionSettings";
import type { defaultCollectionId } from "../db/idb";
import type { FormMode } from "../types/form.mode";
import type { NoteFormStoreOptions } from "../types/note.form.options";

const { showToast } = useToastStore();
const { openForm } = useNoteFormStore();
const permissionSettings = usePermissionSettingsStore();
let collection: number | defaultCollectionId = 2; // 2 is temporary collection
const visibleNewCollectionForm = ref(false);

function openNoteForm(
  formMode: FormMode,
  isTemporary: boolean,
  collectionId: number,
) {
  const opts: NoteFormStoreOptions = {
    isTemporary: isTemporary,
    collectionId,
    formMode,
  };
  openForm(opts);
}

onMounted(async () => {
  const cleaningResult = await NoteService.clearExpiredNotes();
  if (!cleaningResult.success) {
    showToast("error", cleaningResult.error);
  }
});
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

#temporary-notes-container {
  margin-top: var(--space-8);
}

#note-form-container,
#new-collection-form-container {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}
</style>
