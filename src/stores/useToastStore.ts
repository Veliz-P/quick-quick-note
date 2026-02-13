import { defineStore } from "pinia";
import { ref } from "vue";
import type { ToastType } from "../types/notification.type";

export const useToastStore = defineStore("toast", () => {
  const showingToast = ref(false);
  let timeout: number | null = null;
  const toastMessage = ref("");
  const toastType = ref<ToastType>("info");

  function showToast(
    type: ToastType,
    message: string,
    duration: number = 3000,
  ) {
    if (!message || !message.trim()) return;
    toastMessage.value = message;
    toastType.value = type;
    showingToast.value = true;

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      clearToast();
    }, duration);
  }

  function clearToast() {
    showingToast.value = false;
    if (timeout) clearTimeout(timeout);
    timeout = null;
    toastMessage.value = "";
    toastType.value = "info";
  }

  function closeToast() {
    clearToast();
  }

  return {
    showingToast,
    toastMessage,
    toastType,
    showToast,
    closeToast,
  };
});
