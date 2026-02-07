<template>
  <div class="wrapper" :style="{ backgroundColor: wrapperColor }">
    <button id="close-form-btn">
      <X :size="20" :stroke-width="2.5" @click="emit('closeForm')" />
    </button>
    <div class="card">
      <form @submit.prevent="submitForm">
        <div id="title-container" style="position: relative; width: 100%">
          <label for="title-input"
            ><Paperclip :size="20" id="paperclip-icon"
          /></label>
          <input
            id="title-input"
            placeholder="Título principal"
            required
            type="text"
            v-model="note.title"
            minlength="1"
            maxlenght="100"
          />
        </div>
        <div>
          <div style="position: relative">
            <label
              :class="{ 'text-muted': !includeDescription }"
              for="description-input"
              class="subtitle"
            >
              <TextAlignStart :size="20" />
              Descripción
            </label>
            <input
              type="checkbox"
              @click="includeDescription = !includeDescription"
              @input="note.description = ''"
              id="include-description-checkbox"
              v-model="includeDescription"
            />
          </div>
          <textarea
            v-if="includeDescription"
            id="description-input"
            rows="10"
            placeholder="Escribe los detalles de tu nota aquí..."
            v-model="note.description"
            minlength="5"
            maxlength="1000"
            :required="includeDescription"
          ></textarea>
        </div>
        <div v-if="props.isTemporary">
          <label id="expiration-label" for="" class="subtitle">
            <Calendar1 :size="20" /> Expiración
          </label>
          <div id="expiration-options">
            <div class="label-input-div">
              <label>Fecha</label>
              <input v-model="expirationDate" type="date" :min="Date.now()" />
            </div>
            <div class="label-input-div">
              <label>Hora (24h)</label>
              <input v-model="expirationTime" type="time" />
            </div>
          </div>
        </div>
        <div id="btn-submit-container">
          <button class="btn-primary" type="submit"><Save /> Guardar</button>
          <button class="btn-secondary" @click.prevent="clearForm()">
            <RotateCcw /> Limpiar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted, type Ref } from "vue";
import { ColorService } from "../services/colors.servic";
import { ExpirationNoteService } from "../services/expiration.note.servic";
import type { FormMode } from "../types/form.mode";
import type { Note } from "../models/note";
import { NoteService } from "../services/notes.servic";
import { buildDate } from "../utils/date";
import type { DefaultStores } from "../db/idb";
import { defaultStores } from "../db/idb";

import {
  Paperclip,
  Save,
  TextAlignStart,
  RotateCcw,
  Calendar1,
  X,
} from "lucide-vue-next";
const note: Note = reactive({
  id: undefined,
  title: "",
  description: "",
  createdAt: "",
  expiresAt: "",
});
const expirationDate: Ref<string> = ref("");
const expirationTime: Ref<string> = ref("");
const includeDescription = ref(true);
const wrapperColor = ref("");

interface Props {
  isTemporary?: boolean;
  formMode?: FormMode;
  collection?: number | DefaultStores;
}

const props = withDefaults(defineProps<Props>(), {
  isTemporary: false,
  formMode: "create",
  collection: defaultStores.DEFAULT_NOTES,
});

interface Emits {
  (e: "closeForm"): void;
}

const emit = defineEmits<Emits>();

function clearForm() {
  note.id = undefined;
  note.title = "";
  note.description = "";
  note.createdAt = "";
  note.expiresAt = "";
  includeDescription.value = true;
  expirationDate.value = "";
  expirationTime.value = "";
}

function generateExpirationDate(): string {
  let date: Date | null = null;
  if (!expirationDate.value && !expirationTime.value) {
    date = ExpirationNoteService.getDefaultExpiration();
  }
  date = buildDate(expirationDate.value, expirationTime.value);
  return date.toISOString();
}

async function submitForm() {
  let result: Note | null = null;
  if (props.isTemporary) {
    note.expiresAt = generateExpirationDate();
  }
  try {
    switch (props.formMode) {
      case "create":
        const { id, ...newNote } = note;
        result = await NoteService.createNote(newNote, props.collection);
        break;
      case "edit":
        result = await NoteService.updateNote(note);
        break;
    }
    console.log("success", result);
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  wrapperColor.value = ColorService.getRandomColor();
  console.log(props.collection);
});
</script>
<style scoped>
.card {
  background-color: var(--bg-dark);
  padding: var(--space-8);
  border-radius: var(--rounded-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.wrapper {
  position: relative;
  width: 95%;
  max-width: 550px;
  padding: var(--space-6) var(--space-3);
  border-radius: var(--rounded-xl);
  box-shadow: var(--shadow-xl);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  overflow-x: hidden;
}

input,
textarea {
  padding: var(--space-2);
  background-color: var(--bg);
}

#title-input {
  font-weight: 600;
  background-color: transparent;
  border: none;
  margin-left: var(--space-6);
  font-size: var(--fs-md);
  padding-right: var(--space-8);
}

#title-container {
  font-size: var(--fs-md);
  border: none;
  border-radius: 0px;
  border-bottom: 2px solid var(--border);
}

#title-container:has(input:focus) {
  border-color: var(--secondary-300);
  accent-color: var(--secondary-300);
}

#description-input {
  box-shadow: var(--shadow-sm);
  background-color: var(--bg);
}

#paperclip-icon {
  position: absolute;
  top: 50%;
  left: 1%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

label {
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: var(--space-1);
}

#btn-submit-container {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.label-input-div {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
}

#expiration-options {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  justify-content: space-between;
  gap: var(--space-4);
}

#expiration-options label {
  color: var(--text-muted);
  font-weight: normal;
}

.subtitle {
  margin-bottom: var(--space-3);
}

#include-description-checkbox {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: auto;
}

#close-form-btn {
  position: absolute;
  right: 1%;
  top: 1%;
  background-color: var(--error);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--rounded-full);
  padding: var(--space-2);
  color: var(--light);
  transition: scale 0.2s ease;
  border: 2px solid var(--light);
  box-shadow: var(--shadow-md);
}

#close-form-btn:hover {
  scale: 1.1;
}

@media (min-width: 768px) {
  .wrapper {
    max-height: 650px;
    width: 100%;
  }
  #expiration-options {
    grid-template-columns: 1fr 1fr;
  }

  #btn-submit-container {
    gap: var(--space-3);
    margin-top: var(--space-4);
  }
}
</style>
