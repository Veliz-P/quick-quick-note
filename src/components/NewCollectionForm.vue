<template>
  <div class="new-collection-form-container">
    <h2>
      Nueva colección
      <FolderPlus class="icon" />
    </h2>
    <h3>Organice sus notas en colecciones personalizadas.</h3>

    <form id="collection-form" @submit.prevent="submitForm">
      <div>
        <input
          type="text"
          v-model="collectionName"
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
        <button class="btn-primary" type="submit">Crear</button>
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { FolderPlus } from "lucide-vue-next";
import { CollectionService } from "../services/collection.servic";
import { ref, watch } from "vue";
import { debounce } from "../utils/debounce";
import { useToastStore } from "../stores/useToastStore";
const { showToast } = useToastStore();
import { useActionEventStore } from "../stores/useActionEventStore";
const actionEventStore = useActionEventStore();

const collectionName = ref("");
const collectionExists = ref(false);

watch(
  () => collectionName.value,
  debounce(async (newVal: string) => {
    if (!newVal.trim()) return;
    const exists = await CollectionService.collectionExists(newVal.trim());
    collectionExists.value = exists;
  }),
);

function formatCollectionName() {
  collectionName.value = collectionName.value.replace(
    /[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ_]/g,
    "",
  );
}

interface Emits {
  (e: "closeForm"): void;
  (e: "shouldReload"): void;
}

const emit = defineEmits<Emits>();

function closeForm() {
  emit("closeForm");
}
async function submitForm() {
  console.log("Formulario enviado");
  try {
    if (collectionExists.value) {
      showToast("error", "Ya existe una colección con ese nombre");
      return;
    }
    const collectionCreated = await CollectionService.createCollection(
      collectionName.value.trim(),
    );
    if (collectionCreated && collectionCreated.id) {
      showToast("success", "Colección creada exitosamente");
      actionEventStore.register("collection_created");
      closeForm();
    }
  } catch (error) {
    console.error("Error al crear la colección:", error);
    showToast("error", "Error al crear la colección");
  }
}
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
