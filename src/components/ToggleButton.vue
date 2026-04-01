<template>
  <button
    @click="checked = !checked"
    :class="['toggle-btn', { 'btn-active': checked }]"
  >
    <span :class="['toggle-circle', { active: checked }]"></span>
  </button>
</template>
<script setup lang="ts">
const checked = defineModel("checked", {
  default: false,
});
</script>
<style scoped>
.toggle-btn {
  width: 60px;
  height: 30px;
  background-color: var(--bg);
  border: 2px solid var(--border);
  border-radius: var(--rounded-2xl);
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.toggle-btn.btn-active {
  background-color: var(--primary-500);
}
.toggle-circle {
  width: 45%;
  height: 85%;
  background-color: var(--secondary-100);
  border-radius: var(--rounded-full);
  border: 2px solid var(--border);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 5%;
  transition: transform 0.3s ease;
}

.toggle-circle.active {
  border-color: var(--primary-500);
  transform: translateY(-50%) translateX(100%);
}
</style>
