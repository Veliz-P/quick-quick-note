import { defineStore } from "pinia";
import { ref } from "vue";
import type { ConfirmationDialogOptions } from "../types/confirmation.options";

export const useConfirmationDialogStore = defineStore(
  "confirmationDialog",
  () => {
    const isOpen = ref(false);
    const options = ref<ConfirmationDialogOptions | null>(null);
    let resolver: ((value: boolean) => void) | null = null;

    function confirm(opts: ConfirmationDialogOptions): Promise<boolean> {
      options.value = opts;
      isOpen.value = true;
      return new Promise((resolve) => {
        resolver = resolve;
      });
    }

    function accept() {
      resolver?.(true);
      reset();
    }

    function cancel() {
      resolver?.(false);
      reset();
    }

    function reset() {
      isOpen.value = false;
      options.value = null;
      resolver = null;
    }

    return {
      isOpen,
      options,
      confirm,
      accept,
      cancel,
    };
  },
);
