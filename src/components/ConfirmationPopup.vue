<template>
  <div class="confirmation-container">
    <div class="icon-wrapper">
      <div class="icon">
        <CircleHelp :size="35" />
      </div>
    </div>
    <h2
      :style="{
        marginBottom: options?.description
          ? 'var(--space-1)'
          : 'var(--space-6)',
      }"
    >
      {{ options?.question || "¿Pregunta?" }}
    </h2>
    <h3 v-if="options?.description">
      {{ options?.description || "Descripción" }}
    </h3>
    <div class="confirmation-options">
      <button class="btn-primary" @click="accept">
        {{ options?.confirmText || "Sí" }}
      </button>
      <button class="btn-secondary" @click="cancel">
        {{ options?.cancelText || "No" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleHelp } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { useConfirmationDialogStore } from "../stores/useConfirmationDialogStore";

const { options } = storeToRefs(useConfirmationDialogStore());
const { accept, cancel } = useConfirmationDialogStore();
</script>

<style scoped>
.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--space-4);
}

.icon {
  display: flex;
  justify-content: center;
  color: var(--secondary-400);
  background-color: var(--secondary-200);
  padding: var(--space-3);
  border-radius: var(--rounded-full);
}

.dark .icon {
  color: var(--secondary-300);
  background-color: var(--secondary-600);
}

.confirmation-container {
  border: 1px solid var(--border);
  background-color: var(--bg-dark);
  padding: var(--space-8);
  border-radius: var(--rounded-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  width: 90%;
}

.confirmation-options {
  display: flex;
  gap: var(--space-3);
}

.confirmation-options button {
  flex: 1;
  padding: var(--space-2) var(--space-4);
  flex-wrap: wrap;
}

.confirmation-container h2 {
  font-size: var(--fs-md);
  font-weight: bold;
  text-align: center;
}

.confirmation-container h3 {
  font-size: var(--fs-base);
  font-weight: normal;
  text-align: center;
  margin-bottom: var(--space-6);
  color: var(--text-muted);
}

@media (min-width: 768px) {
  .confirmation-container {
    width: 100%;
    max-width: 450px;
  }
}
</style>
