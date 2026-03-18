import { ref } from "vue";
import { defineStore } from "pinia";
import type { Note } from "../models/note";
import type { NoteFormStoreOptions } from "../types/note.form.options";

export const useNoteFormStore = defineStore("noteFormStore", () => {
  const isOpen = ref(false);
  const shouldReload = ref(false);
  const resultData = ref<Note | null>(null);
  const options = ref<NoteFormStoreOptions>({
    isTemporary: false,
    note: null,
    collectionId: 1,
    formMode: "create",
  });

  function openForm(opts: NoteFormStoreOptions) {
    if (!opts) return;
    options.value = {
      isTemporary: opts.isTemporary ?? false,
      note: opts.note ?? null,
      collectionId: opts.collectionId ?? 1,
      formMode: opts.formMode ?? "create",
    };
    isOpen.value = true;
  }

  function resetOptionsToDefault(deep: boolean = false) {
    if (deep) {
      resultData.value = null;
    }
    isOpen.value = false;
    options.value = {
      isTemporary: false,
      note: null,
      collectionId: 1,
      formMode: "create",
    };
  }

  let timer: number | null = null;
  function closeForm(reload: boolean = false, result: Note | null = null) {
    shouldReload.value = reload;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      shouldReload.value = false;
    }, 50);
    if (result) {
      resultData.value = result;
      resetOptionsToDefault();
      return;
    }
    resetOptionsToDefault(true);
  }

  return {
    isOpen,
    shouldReload,
    resultData,
    options,
    openForm,
    closeForm,
  };
});
