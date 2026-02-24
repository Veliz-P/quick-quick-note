<template>
  <div id="root-layout">
    <div id="sidebar-container">
      <Sidebar />
    </div>
    <div id="subviews-container">
      <RouterView />
    </div>
  </div>

  <div id="toast-container" v-show="showingToast">
    <ToastNotification :message="toastMessage" :type="toastType" />
  </div>

  <div id="confirmation-dialog-container" v-show="isOpen">
    <ConfirmationPopup />
  </div>
</template>

<script setup lang="ts">
import Sidebar from "../components/Sidebar.vue";
import ToastNotification from "../components/ToastNotification.vue";
import ConfirmationPopup from "../components/ConfirmationPopup.vue";
import { RouterView } from "vue-router";
import { useToastStore } from "../stores/useToastStore";
import { storeToRefs } from "pinia";
import { useConfirmationDialogStore } from "../stores/useConfirmationDialogStore";
const { isOpen } = storeToRefs(useConfirmationDialogStore());

const { toastMessage, toastType, showingToast } = storeToRefs(useToastStore());
</script>

<style scoped>
#root-layout {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
}

#subviews-container {
  overflow: auto;
  overflow-x: hidden;
  padding: var(--space-4) var(--space-8);
  width: 100%;
}

#toast-container {
  position: fixed;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: var(--shadow-md);
  border-radius: var(--rounded-3xl);
  width: 100%;
  max-width: 75%;
}

#confirmation-dialog-container {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}

@media (min-width: 768px) {
  #root-layout {
    flex-direction: row;
  }
  #sidebar-container {
    width: 25%;
    max-width: 250px;
    height: 100%;
  }

  #subviews-container {
    padding: var(--space-4) var(--space-10);
  }

  #toast-container {
    top: 5%;
    bottom: auto;
    width: 100%;
    max-width: 365px;
  }
}
</style>
