<template>
  <div class="new-collection-form-container">
    <h2>
      {{ props.formMode === "create" ? "Nueva colección" : "Editar colección" }}
      <FolderPlus class="icon" />
    </h2>
    <h3>Organice sus notas en colecciones personalizadas.</h3>

    <form id="collection-form" @submit.prevent="submitForm">
      <div>
        <input
          type="text"
          v-model="collection.name"
          placeholder="Nombre de la colección"
          required
          minlength="1"
          maxlength="50"
          @input="formatCollectionName"
        />
        <p class="collection-exists-warning" v-if="collectionExists">
          La colección ya existe
        </p>
      </div>

      <div class="submit-options">
        <button class="btn-secondary" type="button" @click="closeForm">
          Cancelar
        </button>
        <button class="btn-primary" type="submit">Guardar</button>
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { FolderPlus } from "lucide-vue-next";
import { CollectionService } from "../services/collection.servic";
import { ref, watch, reactive, onMounted, toRaw } from "vue";
import { debounce } from "../utils/debounce";
import { useToastStore } from "../stores/useToastStore";
const { showToast } = useToastStore();
import { useActionEventStore } from "../stores/useActionEventStore";
import type { FormMode } from "../types/form.mode";
import type { Collection } from "../models/collection";
const actionEventStore = useActionEventStore();

const collection = reactive<Collection>({
  id: null,
  name: "",
  createdAt: "",
  isDeleted: false,
});
const collectionExists = ref(false);

watch(
  () => collection.name,
  debounce(async (newVal: string) => {
    if (!newVal.trim()) return;
    const excludeId = collection?.id || undefined;
    const exists = await CollectionService.collectionExists(
      newVal.trim(),
      excludeId,
    );
    collectionExists.value = exists;
  }),
);

function formatCollectionName() {
  collection.name = collection.name.replace(/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ_]/g, "");
}

interface Props {
  formMode?: FormMode;
  collection?: Collection | null;
}

const props = withDefaults(defineProps<Props>(), {
  formMode: "create",
  collection: null,
});

interface Emits {
  (e: "closeForm"): void;
  (e: "shouldReload"): void;
  (e: "collectionResult", collection: Collection): void;
}

const emit = defineEmits<Emits>();

function closeForm() {
  emit("closeForm");
}
async function submitForm() {
  try {
    if (collectionExists.value) {
      showToast("error", "Ya existe una colección con ese nombre");
      return;
    }
    if (props.formMode == "create") {
      const collectionCreated = await CollectionService.createCollection(
        collection.name,
      );
      if (collectionCreated && collectionCreated.id) {
        showToast("success", "Colección creada exitosamente");
        actionEventStore.register("collection_created");
        emit("shouldReload");
      }
    } else if (props.formMode == "edit") {
      await CollectionService.updateCollection(toRaw(collection) as Collection);
      showToast("success", "Colección actualizada exitosamente");
      emit("collectionResult", collection);
    }

    closeForm();
  } catch (error) {
    console.error("Error al crear la colección:", error);
    showToast("error", "Error al crear la colección");
  }
}

function prefillForm() {
  if (!props.collection || props.formMode !== "edit") return;
  collection.id = props.collection.id;
  collection.name = props.collection.name;
  collection.createdAt = props.collection.createdAt;
  collection.isDeleted = props.collection.isDeleted;
}

onMounted(() => {
  prefillForm();
});
</script>
<style scoped>
.new-collection-form-container {
  border: 1px solid var(--border);
  background-color: var(--bg-dark);
  padding: var(--space-8);
  border-radius: var(--rounded-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  width: 90%;
}

.new-collection-form-container h2 {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-md);
  margin-bottom: var(--space-1);
}

h3 {
  font-size: var(--fs-base);
  font-weight: normal;
  margin-bottom: var(--space-4);
  color: var(--text-muted);
}

.icon {
  color: var(--secondary-400);
}

.submit-options {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  flex-wrap: wrap;
}

.collection-exists-warning {
  color: var(--error);
  font-size: var(--fs-sm);
}

#collection-form input {
  margin-bottom: var(--space-1);
}

@media (min-width: 768px) {
  .new-collection-form-container {
    width: 100%;
    max-width: 500px;
  }
}
</style>
