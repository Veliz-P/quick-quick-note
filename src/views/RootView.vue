<template>
  <div id="root-layout">
    <div id="sidebar-container">
      <Sidebar />
    </div>
    <div id="subviews-container">
      <RouterView />
    </div>
  </div>
  <div id="toast-container" v-show="showingToast">
    <ToastNotification :message="toastMessage" :type="toastType" />
  </div>
  <div
    id="confirmation-dialog-container"
    class="popup-layout"
    v-show="isConfirmationDialogOpen"
  >
    <ConfirmationPopup />
  </div>
  <div id="note-form-container" class="popup-layout" v-if="isNoteFormOpen">
    <NoteForm />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from "vue";
import Sidebar from "../components/Sidebar.vue";
import ToastNotification from "../components/ToastNotification.vue";
import ConfirmationPopup from "../components/ConfirmationPopup.vue";
import NoteForm from "../components/NoteForm.vue";
import { RouterView } from "vue-router";
import { useToastStore } from "../stores/useToastStore";
import { storeToRefs } from "pinia";
import { useConfirmationDialogStore } from "../stores/useConfirmationDialogStore";
import { useNoteFormStore } from "../stores/useNoteFormStore";
import { NoteService } from "../services/notes.servic";
import { CollectionService } from "../services/collection.servic";
import { useRecycleBinSettings } from "../stores/useRecycleBinSettings";

const { isOpen: isNoteFormOpen } = storeToRefs(useNoteFormStore());
const { isOpen: isConfirmationDialogOpen } = storeToRefs(
  useConfirmationDialogStore(),
);
const { toastMessage, toastType, showingToast } = storeToRefs(useToastStore());
const { showToast } = useToastStore();
const recyclingBinSettings = useRecycleBinSettings();

async function clearRecycleBin() {
  const recyclingBinDuration = recyclingBinSettings.getRecycleBinDuration();
  const noteDeletionResult =
    await NoteService.cleanDeletedRecords(recyclingBinDuration);
  const collectionDeletionResult =
    await CollectionService.cleanDeletedCollections(recyclingBinDuration);
  if (!noteDeletionResult.success || !collectionDeletionResult.success) {
    showToast("error", "Ocurrio un error al limpiar la papelera");
    return;
  }
  const deletedNotes = noteDeletionResult.data || 0;
  const deletedCollections = collectionDeletionResult.data || 0;
  if (deletedNotes > 0 || deletedCollections > 0) {
    showToast(
      "success",
      `${deletedNotes} notas y ${deletedCollections} colecciones borradas de la papelera.`,
    );
  }
}

onBeforeMount(async () => {
  await clearRecycleBin();
});
</script>

<style scoped>
#root-layout {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
}

#subviews-container {
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-4) var(--space-8);
  width: 100%;
}

#toast-container {
  position: fixed;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: var(--shadow-md);
  border-radius: var(--rounded-3xl);
  width: 100%;
  max-width: 75%;
}

#sidebar-container {
  position: relative;
  z-index: 2;
}

@media (min-width: 768px) {
  #root-layout {
    flex-direction: row;
  }
  #sidebar-container {
    width: 25%;
    max-width: 250px;
    height: 100%;
  }

  #subviews-container {
    padding: var(--space-4) var(--space-10);
  }

  #toast-container {
    top: 5%;
    bottom: auto;
    width: 100%;
    max-width: 365px;
  }
}
</style>
