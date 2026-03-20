<template>
  <div id="collection-folders">
    <div id="new-folder-action" class="collection-folder">
      <button class="tertiary-btn" @click="openForm('create')">
        <div class="folder-icon"><FolderPlus /></div>
        Nuevo
      </button>
    </div>

    <div
      class="collection-folder"
      v-for="collection in collections"
      :key="collection.id!"
      @click="openCollection(collection)"
      :class="collection.id! === 2 ? 'hidden' : ''"
    >
      <div class="folder-icon">
        <Folder />
      </div>
      <div>
        <h4>
          {{
            collection.name.length > 17
              ? collection.name.slice(0, 17) + "..."
              : collection.name
          }}
        </h4>
        <p>{{ formatDate(collection.createdAt) }}</p>
      </div>
      <div class="collection-name-popup" v-if="collection.name.length > 17">
        <p>{{ collection.name }}</p>
      </div>
      <!-- !! hide extra options for default collection because it can't be edited  -->
      <button
        class="btn-secondary collection-actions-btn"
        @click.stop="toggleExtraOptions(collection)"
        v-if="collection.id! !== 1"
      >
        <Ellipsis :size="20" />
      </button>
      <div
        @click.stop=""
        v-if="activeId === collection.id"
        class="extra-options"
      >
        <ul>
          <li @click.stop="openForm('edit', collection)" class="delete-item">
            <button><FolderPen :size="20" /> Renombrar</button>
          </li>
          <li @click.stop="deleteCollection" class="delete-item">
            <button><Trash2 :size="20" /> Borrar</button>
          </li>
          <li>
            <input v-model="deletePermanently" type="checkbox" />
            <label>¿Borrar sin papelera?</label>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="hasMore" id="collection-end-list">
      <div class="spin-item">
        <Loader :size="20" :stroke-width="2.5" />
      </div>
      Cargando...
    </div>
  </div>

  <div class="popup-layout new-collection-form" v-if="visibleNewCollectionForm">
    <NewCollectionForm
      :form-mode="formMode"
      :collection="collectionUpdate"
      @close-form="resetFormOptions"
      @collection-result="updateCollectionNode"
      @should-reload="resetCollectionList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Collection } from "../models/collection";
import type { PaginatedResult } from "../types/paginated.result";
import NewCollectionForm from "./CollectionForm.vue";
import { CollectionService } from "../services/collection.servic";
import { formatDate } from "../utils/date";
import {
  Folder,
  FolderPlus,
  Ellipsis,
  Trash2,
  FolderPen,
  Loader,
} from "lucide-vue-next";
import { useConfirmationDialogStore } from "../stores/useConfirmationDialogStore";
const { confirm } = useConfirmationDialogStore();
import type { ConfirmationDialogOptions } from "../types/confirmation.options";
import { useToastStore } from "../stores/useToastStore";
import type { FormMode } from "../types/form.mode";
const { showToast } = useToastStore();

let formMode: FormMode = "create";
const collectionUpdate = ref<Collection | null>(null);

const permanentDeleteOpts: ConfirmationDialogOptions = {
  question: "¿Estás seguro de que quieres borrar esta colección?",
  description: "Esta acción no se puede deshacer.",
  confirmText: "Sí, borrar permanentemente",
  cancelText: "No, cancelar",
};
const currentCollection = defineModel<Collection | null>("currentCollection", {
  default: null,
});

const collections = ref<Collection[]>([]);
let currentCursor: string | null = null;
const hasMore = ref(false);
const isLoading = ref(false);
const visibleNewCollectionForm = ref(false);
const activeId = ref<number | null>(null);
const deletePermanently = ref(false);

function removeCollectionNode() {
  if (!collections) return;
  collections.value = collections.value.filter(
    (collection) => collection.id !== activeId.value,
  );
}

function updateCollectionNode(collection: Collection) {
  if (formMode !== "edit" || !collection) return;
  const targetCollection = collections.value.find(
    (c) => c.id === collection.id,
  );
  if (!targetCollection) return;
  const index = collections.value.indexOf(targetCollection);
  targetCollection.name = collection.name;
  collections.value[index] = targetCollection;
}

function toggleExtraOptions(collection?: Collection) {
  if (!collection) {
    activeId.value = null;
    return;
  }
  if (collection.id === activeId.value) {
    activeId.value = null;
    return;
  }
  activeId.value = collection.id!;
}

async function deleteCollection() {
  try {
    const deleteCollectionId = activeId.value;
    if (!deleteCollectionId)
      throw new Error("No collection selected for deletion");
    if (!deletePermanently.value) {
      await CollectionService.softDeleteCollection(deleteCollectionId);
      showToast("success", "Colección movida a papelera");
    } else {
      const ok = await confirm(permanentDeleteOpts);
      if (!ok) return;
      await CollectionService.deleteCollection(deleteCollectionId);
      showToast("success", "Colección borrada permanentemente");
    }
    removeCollectionNode();
    toggleExtraOptions();
    currentCollection.value = null;
  } catch (error) {
    console.error("Error al borrar la colección:", error);
    showToast("error", "Ocurrió un error al borrar la colección");
  }
}

async function fetchCollections() {
  if (isLoading.value) return;
  isLoading.value = true;
  const prevCursor = currentCursor || null;
  const result: PaginatedResult<Collection> =
    await CollectionService.getCollections(prevCursor);
  currentCursor = result.lastKey as string;
  hasMore.value = result.hasMore;
  collections.value.push(...result.data);
  isLoading.value = false;
}

function openCollection(collection: Collection) {
  currentCollection.value = collection;
}

function openForm(mode: FormMode, collection?: Collection) {
  visibleNewCollectionForm.value = true;
  if (collection) {
    collectionUpdate.value = collection;
  }
  formMode = mode;
}

function resetFormOptions() {
  visibleNewCollectionForm.value = false;
  collectionUpdate.value = null;
  formMode = "create";
  toggleExtraOptions();
}

let container: HTMLElement | null = null;
let collectionEndList: HTMLElement | null = null;
let observer: IntersectionObserver | null = null;

function setInfinteScroll() {
  container = document.getElementById("collection-folders");
  collectionEndList = document.getElementById("collection-end-list");
  if (!collectionEndList || !container) return;
  const opts = {
    root: container,
    threshold: 0.1,
    // rootMargin: "0px 200px 0px 0px",
  };
  observer = new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting && hasMore.value) {
        await fetchCollections();
      }
    });
  }, opts);

  observer.observe(collectionEndList);
}

async function resetCollectionList() {
  collections.value = [];
  currentCursor = null;
  hasMore.value = false;
  isLoading.value = false;
  await fetchCollections();
  observer?.disconnect();
  setInfinteScroll();
}

onMounted(async () => {
  await fetchCollections();
  setInfinteScroll();
});
</script>

<style scoped>
#collection-folders {
  position: relative;
  width: 100%;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: var(--space-4);
  gap: var(--space-6);
  scroll-behavior: smooth;
}

.collection-folder {
  background-color: var(--bg);
  border: 2px solid var(--border);
  padding: var(--space-8) var(--space-3);
  border-radius: var(--rounded-md);
  text-transform: capitalize;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 230px;
  height: 150px;
  position: relative;
  transition: border-color 0.2s ease;
  cursor: pointer;
}
.collection-folder:hover {
  border-color: var(--secondary-300);
}

.collection-folder h4 {
  font-size: var(--fs-base);
  font-weight: bold;
  text-align: center;
  margin-bottom: var(--space-1);
}

.collection-folder h4 + p {
  font-size: var(--fs-sm);
  text-align: center;
  color: var(--text-muted);
}

.folder-icon {
  color: var(--secondary-300);
}

.collection-name-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  text-align: center;
  background-color: var(--dark);
  color: var(--light);
  border-radius: var(--rounded-lg);
  padding: var(--space-2) var(--space-4);
  font-size: var(--fs-sm);
  display: none;
  word-break: break-all;
}
.dark .collection-name-popup {
  background-color: var(--secondary-800);
  color: var(--text);
}
.collection-folder:hover .collection-name-popup,
.collection-folder:focus .collection-name-popup {
  display: block;
}

#new-folder-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 230px;
  height: 150px;
}
#new-folder-action:hover {
  border-color: var(--border);
}

.hidden {
  display: none;
}

.collection-actions-btn {
  padding: var(--space-1);
  border-radius: var(--rounded-full);
  border-color: transparent;
  transition: border-color 0.2s ease;
  position: absolute;
  top: 3%;
  right: 3%;
}
.collection-actions-btn:hover {
  border-color: var(--border);
}

.extra-options {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  border-radius: var(--rounded-lg);
  background-color: var(--bg-light);
  position: absolute;
  right: 0;
  top: 25%;
  box-shadow: var(--shadow-lg);
  z-index: 2;
  border: 2px solid var(--border);
}
.extra-options ul {
  list-style-type: none;
}
.extra-options li {
  padding: var(--space-1);
  padding-right: var(--space-12);
  padding-left: var(--space-3);
  padding-top: var(--space-2);
  padding-bottom: var(--space-2);
  font-size: var(--fs-sm);
  color: var(--secondary-400);
}
.extra-options button {
  font-size: var(--fs-sm);
  color: var(--secondary-400);
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.dark .extra-options button {
  color: var(--secondary-200);
}
.dark .extra-options li:hover {
  background-color: var(--secondary-500);
}
.extra-options li:last-child {
  display: flex;
  flex-direction: row;
  gap: var(--space-2);
  padding: var(--space-1);
  padding-right: var(--space-8);
  padding-left: var(--space-3);
  padding-top: var(--space-2);
  padding-bottom: var(--space-3);
  font-size: var(--fs-sm);
  transition: background-color 0.2s ease;
}
.dark .extra-options li:last-child {
  color: var(--secondary-200);
}
.extra-options li:hover {
  background-color: var(--secondary-100);
}
.extra-options li:last-child:hover {
  background-color: inherit;
  cursor: default;
}
.extra-options input {
  width: auto;
}

#collection-end-list {
  padding: var(--space-4);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: var(--fs-sm);
  gap: var(--space-1);
}

#collection-end-list div {
  display: flex;
  align-items: center;
}

.spin-item {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
