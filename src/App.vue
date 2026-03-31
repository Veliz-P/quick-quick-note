<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onBeforeMount } from "vue";
import { RouterView } from "vue-router";
import { ColorService } from "./services/colors.servic";
import { ThemeService } from "./services/theme.servic";

onBeforeMount(() => {
  ColorService.checkConfig();
  ThemeService.checkConfig();
});
</script>
