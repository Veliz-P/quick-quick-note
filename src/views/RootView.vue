<template>
  <div id="root-layout">
    <div id="sidebar-container">
      <Sidebar />
    </div>
    <div id="subviews-container">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from "../components/Sidebar.vue";
import { RouterView } from "vue-router";
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

@media (min-width: 768px) {
  #root-layout {
    flex-direction: row;
  }
  #sidebar-container {
    width: 25%;
    max-width: 250px;
    height: 100%;
  }
}
</style>
