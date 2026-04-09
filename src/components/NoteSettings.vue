<template>
  <section class="settings-section">
    <h3>Notas <NotepadText /></h3>
    <p>Ajusta el comportamiento de sus notas.</p>
    <ul class="options-list">
      <li>
        <div>
          <h4>Duración predeterminada de notas temporales</h4>
          <p>
            Las nuevas notas expirarán durante
            <span style="text-transform: capitalize">
              {{ expirationDateEstimation }}
            </span>
            a las
            {{ temporaryNotesDuration.hour }}:{{
              temporaryNotesDuration.minute
            }}
            {{ temporaryNotesDuration.hour > 11 ? "PM" : "AM" }}
          </p>
        </div>
        <div id="time-picker">
          <div>
            <h5>Días</h5>
            <button
              class="btn-secondary"
              @click="temporaryNotesDuration.days++"
            >
              <Plus :size="16" />
            </button>
            <input
              type="text"
              maxlength="2"
              v-model="temporaryNotesDuration.days"
            />
            <button
              class="btn-secondary"
              @click="temporaryNotesDuration.days--"
            >
              <Minus :size="16" />
            </button>
          </div>
          <div id="hour">
            <h5>Hora</h5>
            <button
              class="btn-secondary"
              @click="temporaryNotesDuration.hour++"
            >
              <Plus :size="16" />
            </button>
            <input
              type="text"
              maxlength="2"
              v-model="temporaryNotesDuration.hour"
            />
            <button
              class="btn-secondary"
              @click="temporaryNotesDuration.hour--"
            >
              <Minus :size="16" />
            </button>
          </div>
          <div id="minute">
            <h5>Minuto</h5>
            <button
              class="btn-secondary"
              @click="temporaryNotesDuration.minute++"
            >
              <Plus :size="16" />
            </button>
            <input
              type="text"
              maxlength="2"
              v-model="temporaryNotesDuration.minute"
            />
            <button
              class="btn-secondary"
              @click="temporaryNotesDuration.minute--"
            >
              <Minus :size="16" />
            </button>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { NotepadText } from "lucide-vue-next";
import { Plus, Minus } from "lucide-vue-next";
import { formatDate } from "../utils/date";
import { useNoteSettingsStore } from "../stores/useNoteSettingsStore";
import type { TemporaryNotesDuration } from "../stores/useNoteSettingsStore";
const noteSettings = useNoteSettingsStore();
const temporaryNotesDuration = ref<TemporaryNotesDuration>({
  days: 1,
  hour: 0,
  minute: 0,
});
const reloadSettings = defineModel("reloadSettings", {
  default: false,
});
watch(reloadSettings, (newVal) => {
  if (newVal) {
    loadSettings();
  }
});
const expirationDateEstimation = computed(() => {
  const { days, hour, minute } = temporaryNotesDuration.value;
  const now = new Date();
  now.setDate(now.getDate() + days);
  now.setHours(hour, minute);
  return formatDate(now.toISOString());
});
const MAX_TEMPORARY_NOTES_DAYS = 15;
function sanitizeNumberInput(rawValue: string) {
  const regex = /[^\d/]/g;
  const replacedValue = rawValue.replace(regex, "");
  return isNaN(Number(replacedValue)) ? 0 : Number(replacedValue);
}
watch(
  () => temporaryNotesDuration.value,
  (newDuration) => {
    const { days, hour, minute } = newDuration;
    temporaryNotesDuration.value.days = sanitizeNumberInput(String(days));
    temporaryNotesDuration.value.hour = sanitizeNumberInput(String(hour));
    temporaryNotesDuration.value.minute = sanitizeNumberInput(String(minute));

    if (hour > 23) {
      temporaryNotesDuration.value.hour = 23;
    } else if (hour < 0) {
      temporaryNotesDuration.value.hour = 0;
    }

    if (minute > 59) {
      temporaryNotesDuration.value.minute = 59;
    } else if (minute < 0) {
      temporaryNotesDuration.value.minute = 0;
    }

    if (days > MAX_TEMPORARY_NOTES_DAYS) {
      temporaryNotesDuration.value.days = MAX_TEMPORARY_NOTES_DAYS;
    } else if (days < 0) {
      temporaryNotesDuration.value.days = 0;
    } else if (days === 0 && hour === 0 && minute === 0) {
      temporaryNotesDuration.value.hour = 23;
      temporaryNotesDuration.value.minute = 59;
    }
    noteSettings.setTemporaryNotesDuration(temporaryNotesDuration.value);
  },
  { deep: true },
);
function loadSettings() {
  temporaryNotesDuration.value = noteSettings.getTemporaryNotesDuration();
}
onMounted(() => {
  loadSettings();
});
</script>
<style scoped>
#time-picker {
  display: flex;
}
#time-picker h5 {
  font-size: var(--fs-sm);
  color: var(--text-muted);
}
#time-picker > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  border-right: 2px solid var(--border);
  padding: 0 var(--space-4);
}
#time-picker input {
  width: 40px;
  flex-shrink: 0;
  background-color: var(--bg);
  text-align: center;
}
#time-picker .btn-secondary {
  padding: var(--space-1);
  border-radius: var(--rounded-full);
  margin: var(--space-1) 0;
}
#hour,
#minute {
  border-right: none !important;
}
#hour {
  padding-right: var(--space-2) !important;
}
#minute {
  padding-left: var(--space-2) !important;
}
</style>
