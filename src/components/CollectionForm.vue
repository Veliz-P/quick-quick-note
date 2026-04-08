<template>
  <div class="new-collection-form-container">
    <h2 class="form-header">
      {{ props.formMode === "create" ? "Nueva colección" : "Editar colección" }}
      <FolderPlus :size="23" class="form-icon" />
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
import { useCollectionSettings } from "../stores/useCollectionSettings";
import { useActionEventStore } from "../stores/useActionEventStore";
import { usePermissionSettingsStore } from "../stores/usePermissionSettings";
const { showToast } = useToastStore();
const collectionSettings = useCollectionSettings();
const { register } = useActionEventStore();
const permissionSettings = usePermissionSettingsStore();
import type { FormMode } from "../types/form.mode";
import type { Collection } from "../models/collection";
import type { ResultPattern } from "../types/result.pattern";

const collection = reactive<Collection>({
  id: null,
  name: "",
  createdAt: "",
  isDeleted: false,
  hasDeletedNotes: false,
  maxSize: collectionSettings.getMaxNotesPerCollection(),
  currentSize: 0,
});
const collectionExists = ref(false);

watch(
  () => collection.name,
  debounce(async (newVal: string) => {
    if (!newVal.trim()) return;
    const excludeId = collection?.id || undefined;
    const existingResult = await CollectionService.collectionExists(
      newVal.trim(),
      excludeId,
    );
    if (!existingResult.success) return;
    collectionExists.value = existingResult.data as boolean;
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
  if (collectionExists.value) {
    showToast("error", "Ya existe una colección con ese nombre");
    return;
  }
  let result: ResultPattern<Collection>;
  let msg = "";
  switch (props.formMode) {
    case "create":
      const maxSize = collectionSettings.getMaxNotesPerCollection();
      result = await CollectionService.createCollection(
        collection.name,
        maxSize,
      );
      msg = "Colección creada exitosamente";
      break;
    case "edit":
      result = await CollectionService.updateCollection(
        toRaw(collection) as Collection,
      );
      msg = "Colección actualizada exitosamente";
      break;
  }
  if (!result.success) {
    showToast("error", result.error);
    return;
  }
  if (
    permissionSettings.getShowActivityHistory() &&
    props.formMode == "create"
  ) {
    register("collection_created");
  }
  showToast("success", msg);
  if (props.formMode == "create") {
    emit("shouldReload");
  } else if (props.formMode == "edit") {
    emit("collectionResult", collection);
  }
  closeForm();
}

function prefillForm() {
  if (!props.collection || props.formMode !== "edit") return;
  collection.id = props.collection.id;
  collection.name = props.collection.name;
  collection.createdAt = props.collection.createdAt;
  collection.isDeleted = props.collection.isDeleted;
  collection.hasDeletedNotes = props.collection.hasDeletedNotes;
  collection.maxSize = props.collection.maxSize;
  collection.currentSize = props.collection.currentSize;
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
