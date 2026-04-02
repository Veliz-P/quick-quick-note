<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onBeforeMount } from "vue";
import { RouterView } from "vue-router";
import { useThemeSettingsStore } from "./stores/useThemeSettingsStore";
const { loadThemeConfig } = useThemeSettingsStore();

onBeforeMount(() => {
  loadThemeConfig();
});
</script>
