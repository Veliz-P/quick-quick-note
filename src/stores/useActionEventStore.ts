import { defineStore } from "pinia";
import { ref } from "vue";

import type { ActionEvent, ActionEventType } from "../types/action.event";

export const useActionEventStore = defineStore(
  "actionEvent",
  () => {
    const actions = ref<ActionEvent[]>([]);
    const LIMIT = 50;

    function applyLimit() {
      if (actions.value.length > LIMIT) {
        actions.value = actions.value.slice(-LIMIT);
      }
    }

    function sortByDate() {
      if (!actions.value) return;
      actions.value.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      });
    }

    function register(type: ActionEventType) {
      let textContent = "";
      switch (type) {
        case "note_created":
          textContent = "Nueva nota creada";
          break;
        case "note_soft_deleted":
          textContent = "Nota archivada en papelera";
          break;
        case "note_hard_deleted":
          textContent = "Nota borrada permanentemente";
          break;
        case "collection_created":
          textContent = "Nueva colección creada";
          break;
        case "collection_soft_deleted":
          textContent = "Colección archivada en papelera";
          break;
        case "collection_hard_deleted":
          textContent = "Colección borrada permanentemente";
          break;
      }
      const actionEvent: ActionEvent = {
        type,
        timestamp: new Date().toISOString(),
        textContent,
      };
      actions.value.push(actionEvent);
      applyLimit();
      sortByDate();
    }

    function getActions(): ActionEvent[] {
      return actions.value;
    }

    return { actions, register, getActions };
  },
  {
    persist: {
      storage: localStorage,
    },
  },
);
