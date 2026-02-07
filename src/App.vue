<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { ColorService } from "./services/colors.servic";

onMounted(() => {
  const currentColorSet = ColorService.getCurrentColorSet();
  if (!currentColorSet) {
    ColorService.resetColorSet();
  }
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
