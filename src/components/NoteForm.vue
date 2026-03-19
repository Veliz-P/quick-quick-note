<template>
  <div class="wrapper" :style="{ backgroundColor: wrapperColor }">
    <button id="close-form-btn" @click="closeForm()">
      <X :size="20" :stroke-width="2.5" />
    </button>
    <div class="card">
      <h2 class="form-header">
        {{ formMode === "create" ? "Nueva nota" : "Editar nota" }}
        <FilePlusCorner :size="23" class="form-icon" />
      </h2>
      <form @submit.prevent="submitForm">
        <div id="title-container">
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
            maxlength="100"
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
        <div v-if="options.isTemporary">
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
          <div
            class="date-error-message"
            v-if="invalidDate && invalidDateMessage"
          >
            {{ invalidDateMessage }}
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
import { reactive, ref, onMounted, watch, type Ref } from "vue";
import { storeToRefs } from "pinia";
import { ColorService } from "../services/colors.servic";
import { ExpirationNoteService } from "../services/expiration.note.servic";
import { NoteService } from "../services/notes.servic";
import { buildDate, getOnlyDate, formatHour } from "../utils/date";
import { useToastStore } from "../stores/useToastStore";
import { useNoteFormStore } from "../stores/useNoteFormStore";
const { showToast } = useToastStore();
const { options } = storeToRefs(useNoteFormStore());
const { closeForm } = useNoteFormStore();
import {
  Paperclip,
  Save,
  TextAlignStart,
  RotateCcw,
  Calendar1,
  X,
  FilePlusCorner,
} from "lucide-vue-next";
import type { FormMode } from "../types/form.mode";
import type { Note } from "../models/note";

const note: Note = reactive({
  id: null,
  collectionId: options.value.collectionId as number,
  title: "",
  description: "",
  createdAt: "",
  expiresAt: "",
  isDeleted: false,
});
const expirationDate: Ref<string> = ref("");
const expirationTime: Ref<string> = ref("");
const includeDescription = ref(false);
const wrapperColor = ref("");
const formMode = ref<FormMode>("create");
const invalidDate = ref(false);
const invalidDateMessage = ref("");

function clearForm() {
  note.id = undefined;
  note.title = "";
  note.description = "";
  note.createdAt = "";
  note.expiresAt = "";
  includeDescription.value = false;
  expirationDate.value = "";
  expirationTime.value = "";
  formMode.value = "create";
}

watch(
  [() => expirationDate.value, () => expirationTime.value],
  ([date, time]) => {
    const currentDate = new Date();
    const selectedDateTime = buildDate(date, time);

    if (date && !time) {
      const normalizedSelectedDate = new Date(
        getOnlyDate(selectedDateTime) || "",
      );
      const normalizedCurrentDate = new Date(getOnlyDate(currentDate) || "");

      if (normalizedSelectedDate.getTime() < normalizedCurrentDate.getTime()) {
        invalidDate.value = true;
        invalidDateMessage.value =
          "La fecha de expiración no puede ser en el pasado";
        return;
      }
    }

    if (time && date) {
      if (selectedDateTime.getTime() < currentDate.getTime()) {
        invalidDate.value = true;
        invalidDateMessage.value =
          "La fecha y hora de expiración no pueden ser en el pasado";
        return;
      }
    }

    invalidDate.value = false;
    invalidDateMessage.value = "";
  },
);

function generateExpirationDate(): string {
  let date: Date | null = null;
  if (!expirationDate.value && !expirationTime.value) {
    date = ExpirationNoteService.getDefaultExpiration();
  } else {
    date = buildDate(expirationDate.value, expirationTime.value);
  }
  return date.toISOString();
}

async function submitForm() {
  let result: Note | null = null;
  if (options.value.isTemporary) {
    note.expiresAt = generateExpirationDate();
    if (invalidDate.value) {
      showToast("info", "Corriga la fecha antes de guardar");
      return;
    }
  }
  try {
    switch (formMode.value) {
      case "create":
        const { id, ...newNote } = note;
        result = await NoteService.createNote(newNote);
        break;
      case "edit":
        const updateNote = { ...note };
        result = await NoteService.updateNote(updateNote);
        break;
    }
    if (result.id) {
      const message =
        formMode.value === "create"
          ? "Nota creada exitosamente"
          : "Nota actualizada exitosamente";
      formMode.value = "edit";
      note.id = result.id;
      note.createdAt = result.createdAt;
      showToast("success", message);
      closeForm(true);
    }
  } catch (error) {
    console.error(error);
    showToast("error", "Ocurrió un error al guardar la nota");
  }
  // emit("shouldReload");
}

function preFillForm() {
  if (!options.value.note) return;
  const noteInfo = options.value.note;
  note.id = noteInfo.id;
  note.title = noteInfo.title;
  note.description = noteInfo.description;
  note.createdAt = noteInfo.createdAt;
  note.collectionId = options.value.collectionId as number;

  if (options.value.isTemporary && noteInfo.expiresAt) {
    note.expiresAt = noteInfo.expiresAt;
    const date = new Date(note.expiresAt);
    expirationDate.value = getOnlyDate(date) || "";
    expirationTime.value = formatHour(date.toISOString()) || "";
  }

  includeDescription.value = note.description !== "";
}

onMounted(() => {
  wrapperColor.value = ColorService.getRandomColor();
  formMode.value = options.value.formMode as FormMode;
  preFillForm();
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
  max-width: 600px;
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
  position: relative;
  width: 100%;
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

.date-error-message {
  color: var(--error);
  font-size: var(--fs-sm);
  margin-top: var(--space-2);
}

@media (min-width: 768px) {
  .wrapper {
    max-height: 700px;
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
