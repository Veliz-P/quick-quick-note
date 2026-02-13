<template>
  <div
    class="toast-card"
    :style="{ backgroundColor: getStyle.bg, color: 'var(--light)' }"
  >
    <div class="toast-title">
      <component :is="getIcon" :stroke-width="2.5" :size="20" />{{ getTitle }}
    </div>
    <div class="toast-message">
      {{ props.message }}
    </div>
    <button class="toast-close-btn" @click="closeToast">
      <X :size="25" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { Check, AlertTriangle, XCircle, Info, X } from "lucide-vue-next";
import { computed } from "vue";
import type { ToastType } from "../types/notification.type";
import { useToastStore } from "../stores/useToastStore";
const { closeToast } = useToastStore();

interface Props {
  message?: string;
  type?: ToastType;
}

const props = withDefaults(defineProps<Props>(), {
  message: "Notification",
  type: "info",
});

const icons = {
  success: Check,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const getIcon = computed(() => {
  return icons[props.type as keyof typeof icons] || icons.info;
});

const titles = {
  success: "Éxito",
  warning: "Advertencia",
  error: "Error",
  info: "Info",
};

const getTitle = computed(() => {
  return titles[props.type as keyof typeof titles] || "Info";
});

const properties = {
  success: {
    bg: "var(--success)",
  },
  warning: {
    bg: "var(--warning)",
  },
  error: {
    bg: "var(--error)",
  },
  info: {
    bg: "var(--info)",
  },
};

const getStyle = computed(() => {
  return properties[props.type as keyof typeof properties] || properties.info;
});
</script>

<style scoped>
.toast-card {
  background-color: var(--bg);
  color: var(--text);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--rounded-3xl);
  display: flex;
  justify-content: center;
  flex-direction: column;
  font-weight: bold;
  position: relative;
}

.toast-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.toast-message {
  font-weight: normal;
  padding-left: var(--space-6);
  font-size: var(--fs-sm);
  word-break: break-all;
  hyphens: auto;
  padding-right: var(--space-8);
}

.toast-close-btn {
  position: absolute;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
  color: var(--light);
}
</style>
