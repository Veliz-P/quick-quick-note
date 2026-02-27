<template>
  <div v-if="shouldRenderGrid && realNotesLength > 0" class="grid-container">
    <Grid
      class="virtual-grid"
      :length="notesLength"
      :page-size="pageSize"
      :page-provider="pageProvider"
    >
      <template #default="{ item, style }">
        <div
          :key="(item as Note).id!"
          class="note-wrapper"
          :style="{ ...style, backgroundColor: (item as NoteCard).color }"
        >
          <div class="note" @click="openNoteForm(item as Note)">
            <button
              class="btn-secondary note-actions-btn"
              @click.stop="toggleExtraOptions(item as Note)"
            >
              <Ellipsis :size="20" />
            </button>
            <h3>
              {{
                (item as Note).title.length > 50
                  ? (item as Note).title.slice(0, 50) + "..."
                  : (item as Note).title
              }}
            </h3>
            <div v-if="!(item as Note).expiresAt" class="creation-details">
              <p class="note-date">
                {{ formatDate((item as Note).createdAt) }}
              </p>
              <p class="note-date">
                {{ formatHour((item as Note).createdAt) }}
              </p>
            </div>
            <div
              v-else-if="(item as Note).expiresAt"
              class="expiration-details"
            >
              {{
                formatTimeLeft(
                  new Date((item as Note).expiresAt!).getTime() - now.getTime(),
                )
              }}
            </div>
            <div
              @click.stop=""
              v-if="activeId === (item as Note).id"
              class="extra-options"
            >
              <ul>
                <li @click="duplicateNote(item as Note)">
                  <button><Copy :size="20" /> Duplicar</button>
                </li>
                <li>
                  <button><MoveUpRight :size="20" /> Mover a</button>
                </li>
                <li @click="deleteNote()" class="delete-item">
                  <button><Trash2 :size="20" /> Borrar</button>
                </li>
                <li>
                  <input v-model="deletePermanently" type="checkbox" />
                  <label>¿Borrar sin papelera?</label>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </template>
    </Grid>
  </div>

  <div v-else class="empty-state">
    <div class="icon-wrapper">
      <div class="empty-state-icon">
        <NotepadText :size="45" />
      </div>
    </div>
    <h3><strong>Colección vacía</strong></h3>
    <p>Agrega nuevas notas para comenzar.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { NoteService } from "../services/notes.servic";
import type { PaginatedResult } from "../types/paginated.result";
import type { Note } from "../models/note";
import { ColorService } from "../services/colors.servic";
import { formatDate, formatHour, formatTimeLeft } from "../utils/date";
import {
  Ellipsis,
  Copy,
  MoveUpRight,
  Trash2,
  NotepadText,
} from "lucide-vue-next";
import { useToastStore } from "../stores/useToastStore";
const { showToast } = useToastStore();
import type { ConfirmationDialogOptions } from "../types/confirmation.options";
import type { defaultCollectionId } from "../db/idb";
import { useConfirmationDialogStore } from "../stores/useConfirmationDialogStore";
const { confirm } = useConfirmationDialogStore();
import { useActionEventStore } from "../stores/useActionEventStore";
const actionEventStore = useActionEventStore();
import Grid from "vue-virtual-scroll-grid";

const permanentDeleteOpts: ConfirmationDialogOptions = {
  question: "¿Estás seguro de que quieres borrar esta nota?",
  description: "Esta acción no se puede deshacer.",
  confirmText: "Sí, borrar permanentemente",
  cancelText: "No, cancelar",
};

const notes = ref<NoteCard[]>([]);
const pageSize = 5;
let currentCursor: unknown | null = null;
let hasMore = true;
let isLoading = false;
const notesLength = ref(0);
const realNotesLength = ref(0); // It will determine if grid or empty state should be rendered
const shouldRenderGrid = ref(true);

async function fetchNotes() {
  const cursor = (currentCursor as [number, number]) || undefined;
  const result: PaginatedResult<Note> = await NoteService.getNotes(
    props.collection,
    pageSize,
    cursor,
  );
  currentCursor = result.lastKey;
  hasMore = result.hasMore;
  const existingIds = new Set(notes.value.map((note) => note.id));
  const newItems = result.data
    .filter((note) => !existingIds.has(note.id))
    .map((note) => ({
      ...note,
      color: ColorService.getRandomColor(),
    }));
  notes.value.push(...newItems);
}

const pageProvider = async (pageNumber: number, pageSize: number) => {
  const start = pageNumber * pageSize;
  const end = start + pageSize;

  if (notes.value.length >= end) {
    return notes.value.slice(start, end);
  }
  if (isLoading || !hasMore) {
    return notes.value.slice(start, end);
  }
  isLoading = true;
  await fetchNotes();
  if (hasMore) {
    notesLength.value += pageSize;
  } else {
    notesLength.value = notes.value.length;
  }
  isLoading = false;
  return notes.value.slice(start, end);
};

let timeout: number | null = null;
async function refreshNotes() {
  notes.value = [];
  currentCursor = null;
  activeId.value = null;
  hasMore = true;
  isLoading = false;
  realNotesLength.value = 0;
  realNotesLength.value = await NoteService.getCount(props.collection);
  notesLength.value =
    realNotesLength.value < pageSize ? realNotesLength.value : pageSize;
  if (timeout) clearTimeout(timeout);
  shouldRenderGrid.value = false;
  timeout = setTimeout(() => {
    shouldRenderGrid.value = true;
  }, 100);
}

interface Props {
  collection?: number | defaultCollectionId;
  shouldReload?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  collection: 1, // 1 is default collection
  shouldReload: false,
});

interface Emits {
  (e: "open-form", note: Note): void;
}

const emit = defineEmits<Emits>();

const deletePermanently = ref(false);

watch(
  () => props.shouldReload,
  async (newVal) => {
    if (newVal) {
      await refreshNotes();
    }
  },
);

interface NoteCard extends Note {
  color?: string;
}

const activeId = ref<number | null>(null);
function toggleExtraOptions(note?: Note) {
  if (!note) {
    activeId.value = null;
    return;
  }
  if (note.id === activeId.value) {
    activeId.value = null;
    return;
  }
  activeId.value = note.id!;
}

function openNoteForm(note: Note) {
  activeId.value = null;
  let formatedNote = { ...note } as NoteCard;
  delete formatedNote.color;
  emit("open-form", formatedNote);
}

async function duplicateNote(note: Note) {
  try {
    let { id, ...newNote } = note;
    const result = await NoteService.createNote(newNote);
    if (result.id) {
      showToast("success", "Nota duplicada exitosamente");
    }
    toggleExtraOptions();
    await refreshNotes();
  } catch (error) {
    console.error(error);
    showToast("error", "Ocurrió un error al duplicar la nota");
  }
}

async function deleteNote() {
  try {
    const deleteNoteId = activeId.value;
    if (!deleteNoteId) throw new Error("No note selected for deletion");
    if (!deletePermanently.value) {
      await NoteService.softDeleteNote(deleteNoteId);
      showToast("success", "Nota movida a papelera");
      actionEventStore.register("note_soft_deleted");
    } else {
      const ok = await confirm(permanentDeleteOpts);
      if (!ok) return;
      await NoteService.deleteNote(deleteNoteId);
      showToast("success", "Nota borrada permanentemente");
      actionEventStore.register("note_hard_deleted");
    }
    toggleExtraOptions();
    await refreshNotes();
  } catch (error) {
    console.error(error);
    showToast("error", "Ocurrió un error al borrar la nota");
  }
}

const now = ref(new Date());
let interval: number | null = null;

onMounted(async () => {
  if (interval) {
    clearInterval(interval);
  }
  realNotesLength.value = await NoteService.getCount(props.collection);
  notesLength.value =
    realNotesLength.value < pageSize ? realNotesLength.value : pageSize;
  interval = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<style scoped>
.grid-container {
  width: 100%;
  height: 100%;
  margin-bottom: var(--space-4);
}
.virtual-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}
.note {
  padding: var(--space-4);
  background: var(--bg-light);
  border-radius: var(--rounded-3xl);
  height: 130px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  position: relative;
}
.note-wrapper {
  padding: var(--space-3) var(--space-2);
  border-radius: var(--rounded-xl);
  transition: padding 0.2s ease;
  box-shadow: var(--shadow-lg);
}
.note-wrapper:hover {
  padding: var(--space-3);
  cursor: pointer;
}

.note h3 {
  font-size: var(--fs-base);
  width: 100%;
  margin-top: var(--space-2);
  word-break: break-all;
}
.creation-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: var(--text-muted);
  font-size: var(--fs-sm);
}
.expiration-details {
  color: var(--text-muted);
  font-size: var(--fs-sm);
  text-align: left;
  width: 100%;
}
.note-actions-btn {
  padding: var(--space-1);
  border-radius: var(--rounded-full);
  border-color: transparent;
  transition: border-color 0.2s ease;
  position: absolute;
  top: 3%;
  right: 3%;
}
.note-actions-btn:hover {
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
.delete-item {
  border-top: 2px solid var(--border);
  padding-top: var(--space-2) !important;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-state-icon {
  color: var(--primary-500);
  background-color: var(--primary-200);
  padding: var(--space-4);
  border-radius: var(--rounded-full);
}
.dark .empty-state-icon {
  color: var(--primary-300);
  background-color: var(--primary-600);
}
.empty-state h3 {
  font-size: var(--fs-lg);
  margin-bottom: var(--space-1);
}
.empty-state p {
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}
.icon-wrapper {
  opacity: 0.9;
  background-image: radial-gradient(
    var(--secondary-400) 1px,
    transparent 0.8px
  );
  background-size: 10px 10px;
  padding: var(--space-6) var(--space-16);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--space-3);
  width: 100%;
}
.dark .icon-wrapper {
  background-image: radial-gradient(
    var(--secondary-400) 1px,
    transparent 0.8px
  );
}
@media (min-width: 640px) {
  .virtual-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
  .note {
    min-height: 140px;
  }
}
@media (min-width: 1280px) {
  .virtual-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-8);
  }

  .note h3 {
    font-size: var(--fs-md);
    margin-top: var(--space-3);
  }
}
@media (min-width: 1920px) {
  .virtual-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: var(--space-12);
  }
}
</style>
