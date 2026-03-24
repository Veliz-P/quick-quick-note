<template>
  <div id="collection-searcher">
    <div>
      <div style="position: relative">
        <input
          id="search-text"
          v-model="searchText"
          type="text"
          placeholder="Buscar colecciones..."
          maxlength="50"
        />
        <Search class="search-icon form-icon" :size="20" :stroke-width="2.5" />
        <button
          id="delete-text-btn"
          v-if="searchText && searchText.length > 0"
          @click="searchText = ''"
          class="btn-secondary"
        >
          <X :size="16" :stroke-width="2.5" />
        </button>
      </div>
    </div>
    <div id="search-results" v-if="!idleState">
      <ul v-if="resultList.length > 0">
        <li
          v-for="collection in resultList"
          :index="collection.id"
          @click="selectCollection(collection)"
        >
          <div class="folder-icon">
            <FolderInput :size="18" />
          </div>
          {{ collection.name }}
          <button class="pick-option-btn btn-primary">
            <ArrowUpRight :size="18" />
          </button>
        </li>
      </ul>
      <div v-if="resultList.length === 0 && !idleState" id="empty-state">
        <img
          id="no-data-img"
          src="../assets/svg/no-data-found.svg"
          alt="no data found"
        />
        <div>
          <p>No se encontraron coincidencias.</p>
          <p>Por favor, busque de nuevo.</p>
        </div>
        <button
          class="btn-secondary"
          @click="searchText = ''"
          id="btn-clear-search"
        >
          Limpiar búsqueda
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { Search, X, FolderInput, ArrowUpRight } from "lucide-vue-next";
import { debounce } from "../utils/debounce";
import { CollectionService } from "../services/collection.servic";
import { useToastStore } from "../stores/useToastStore";
import type { Collection } from "../models/collection";
const searchText = ref("");
const resultList = ref<Collection[]>([]);
const idleState = ref(true);
const toastStore = useToastStore();

interface Emits {
  (e: "selectedCollection", collection: Collection): void;
}
const emit = defineEmits<Emits>();

const selectCollection = (collection: Collection) => {
  emit("selectedCollection", collection);
};

async function fetchData(search: string = "") {
  const limit = 100;
  const onlyDeleted = false;
  const lastKey = null; // TODO: USE LAST KEY WHEN TRYING TO LOAD MORE THROUGH INFINITE SCROLL
  return await CollectionService.getCollections(
    lastKey,
    limit,
    onlyDeleted,
    search,
  );
}

watch(
  () => searchText.value,
  debounce(async (newSearch: string) => {
    if (!newSearch.trim()) {
      resultList.value = [];
      idleState.value = true;
    }
    if (newSearch && newSearch.trim().length > 0) {
      const fetchResult = await fetchData(newSearch);
      const forbiddenIds = [2]; // Corresponds to temporary notes collection
      if (!fetchResult.success) {
        toastStore.showToast("error", fetchResult.error);
        resultList.value = [];
        return;
      }
      let collections = fetchResult.data?.data || [];
      collections = collections.filter(
        (coll) => !forbiddenIds.includes(coll.id!),
      );
      resultList.value = collections;
      idleState.value = false;
    }
    console.log(resultList.value);
  }, 500),
);
</script>

<style scoped>
#collection-searcher {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 90%;
}
#collection-searcher > div {
  background-color: var(--bg-dark);
  padding: var(--space-4);
  border-radius: var(--rounded-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
}
#collection-searcher > div:first-child:has(input:focus) {
  outline: 2.5px solid var(--secondary-300);
}
#search-text {
  border-color: transparent;
  position: relative;
  padding-left: var(--space-6);
  padding-right: var(--space-10);
}
.search-icon {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}
#delete-text-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: var(--space-1);
  border-radius: var(--rounded-full);
}
.pick-option-btn {
  visibility: hidden;
  padding: var(--space-1);
  position: absolute;
  right: 1%;
  top: 50%;
  transform: translateY(-50%);
}
#search-results {
  padding: var(--space-6) !important;
  display: flex;
  align-items: center;
  justify-content: center;
}
#search-results > ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  max-height: 30vh;
  overflow-y: auto;
}
#search-results > ul > li {
  list-style: none;
  display: flex;
  gap: var(--space-3);
  align-items: center;
  cursor: pointer;
  position: relative;
  padding: var(--space-1);
  color: var(--secondary-400);
  border-radius: var(--rounded-lg);
}
.dark #search-results > ul > li {
  color: var(--secondary-200);
}
#search-results > ul > li:hover {
  background-color: var(--secondary-100);
}
.dark #search-results > ul > li:hover {
  background-color: var(--secondary-500);
}
#search-results > ul > li:hover .pick-option-btn {
  visibility: visible;
}

.folder-icon {
  color: var(--secondary-600);
  background-color: var(--secondary-200);
  padding: var(--space-2);
  border-radius: var(--rounded-full);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dark .folder-icon {
  color: var(--secondary-200);
  background-color: var(--secondary-500);
}

#no-data-img {
  width: 100%;
  height: 100%;
  max-height: 150px;
  object-fit: contain;
}
#empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#empty-state > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-muted);
  text-align: center;
}

#empty-state > div > p:first-child {
  font-weight: bold;
  color: var(--text);
}

#btn-clear-search {
  margin-top: var(--space-6);
  margin-bottom: var(--space-6);
}

.hidden {
  display: none !important;
}

@media (min-width: 768px) {
  #collection-searcher {
    width: 100%;
    max-width: 550px;
  }
  #no-data-img {
    max-height: 175px;
  }
  #search-results > ul {
    max-height: 40vh;
  }
}
</style>
