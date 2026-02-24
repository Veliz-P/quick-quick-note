<template>
  <section id="recent-actions-section">
    <h2>Actividad reciente</h2>
    <div id="recent-actions-container">
      <ul class="event-group" v-if="!isSortedEventsEmpty(calcSortedEvents)">
        <li
          v-for="(group, key) in calcSortedEvents"
          :key="key"
          :class="group?.length !== 0 ? '' : 'hidden'"
        >
          <h4
            v-if="
              typeof key === 'string' &&
              getGroupTranslation(key as DateGroup) !== ''
            "
          >
            {{ getGroupTranslation(key as DateGroup) }}
          </h4>
          <h4 v-else>
            {{ key.replace("year-", "") }}
          </h4>
          <ul class="recent-actions-list">
            <li
              v-for="(action, index) in group"
              class="action-item"
              :key="index"
            >
              <div class="action-icon" :class="getIconClass(action.type)">
                <Component :size="18" :is="getIcon(action.type)" />
              </div>
              <div>
                <p class="action-date">
                  {{
                    key === "today"
                      ? new Date(action.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : new Date(action.timestamp).toLocaleDateString()
                  }}
                </p>
                <p>{{ action.textContent }}</p>
              </div>
            </li>
          </ul>
        </li>
      </ul>
      <div v-else id="activity-empty-state">
        <div id="no-activity-icon-wrapper">
          <img
            id="no-activity-icon"
            width="100"
            height="100"
            src="../assets/svg/no-data.svg"
            alt="No activity"
          />
        </div>
        <p>
          Sin historial registrado, aquí aparacerán tus interacciones con la
          app.
        </p>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useActionEventStore } from "../stores/useActionEventStore";
const { actions } = storeToRefs(useActionEventStore());
import type { FunctionalComponent } from "vue";
import type { ActionEvent, ActionEventType } from "../types/action.event";
import { Plus, Trash, FolderInput } from "lucide-vue-next";
const activityIcons: Record<ActionEventType, FunctionalComponent> = {
  note_created: Plus,
  note_hard_deleted: Trash,
  note_soft_deleted: FolderInput,
  collection_created: Plus,
  collection_hard_deleted: Trash,
  collection_soft_deleted: FolderInput,
};

function getIcon(eventType: ActionEventType) {
  return activityIcons[eventType];
}

const activityClasses: Record<ActionEventType, string> = {
  note_created: "created",
  note_hard_deleted: "hard-deleted",
  note_soft_deleted: "soft-deleted",
  collection_created: "created",
  collection_hard_deleted: "hard-deleted",
  collection_soft_deleted: "soft-deleted",
};

function getIconClass(eventType: ActionEventType) {
  return activityClasses[eventType];
}

type DateGroup = "today" | "thisWeek" | "lastWeek" | "thisMonth" | "thisYear";

type SortedEvents = Record<DateGroup | string, ActionEvent[] | null>;

const calcSortedEvents = computed(() => {
  const sortedEvents: SortedEvents = {
    today: [],
    thisWeek: [],
    lastWeek: [],
    thisMonth: [],
    thisYear: [],
  };
  actions.value.forEach((action) => {
    const now = new Date();
    const eventDate = new Date(action.timestamp);

    if (eventDate.toLocaleString() === "Invalid Date") return;

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today);
    week.setDate(week.getDate() - week.getDay());
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - lastWeek.getDay() - 7);
    const month = new Date(now.getFullYear(), now.getMonth(), 1);

    if (eventDate >= today) {
      sortedEvents.today?.push(action);
    } else if (eventDate >= week) {
      sortedEvents.thisWeek?.push(action);
    } else if (eventDate >= lastWeek) {
      sortedEvents.lastWeek?.push(action);
    } else if (eventDate >= month) {
      sortedEvents.thisMonth?.push(action);
    } else if (eventDate.getFullYear() === now.getFullYear()) {
      sortedEvents.thisYear?.push(action);
    } else {
      const arr = sortedEvents[`year-${eventDate.getFullYear()}`];
      if (!arr) sortedEvents[`year-${eventDate.getFullYear()}`] = [];
      sortedEvents[`year-${eventDate.getFullYear()}`]?.push(action);
    }
  });
  return sortedEvents;
});

function isSortedEventsEmpty(sortedEvents: SortedEvents): boolean {
  if (!sortedEvents) return true;

  return (
    sortedEvents.today?.length === 0 &&
    sortedEvents.thisWeek?.length === 0 &&
    sortedEvents.lastWeek?.length === 0 &&
    sortedEvents.thisMonth?.length === 0 &&
    sortedEvents.thisYear?.length === 0
  );
}

const groupTranslation: Record<DateGroup, string> = {
  today: "Hoy",
  thisWeek: "Esta semana",
  lastWeek: "La semana pasada",
  thisMonth: "Este mes",
  thisYear: "Este año",
};

function getGroupTranslation(group: DateGroup) {
  return groupTranslation[group] || "";
}

onMounted(() => {});
</script>
<style scoped>
#recent-actions-section {
  width: 100%;
}
h2 {
  font-size: var(--fs-lg);
  margin-bottom: var(--space-4);
}
#recent-actions-container {
  background-color: var(--bg);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--rounded-md);
  border: 1.5px solid var(--border);
  width: 100%;
  box-shadow: var(--shadow-sm);
  height: auto;
  /* max-height: 60vh; */
  max-height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.recent-actions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  list-style: none;
  margin-left: var(--space-1);
}

.action-item {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  flex-wrap: wrap;
  word-break: break-all;
  hyphens: auto;
}

.action-date {
  color: var(--text-muted);
  font-size: var(--fs-sm);
  text-transform: capitalize;
}

.action-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-2);
  border-radius: var(--rounded-full);
  color: var(--primary-600);
  background-color: var(--primary-200);
}

.created {
  color: var(--primary-600);
  background-color: var(--primary-200);
}
.dark .created {
  color: var(--primary-200);
  background-color: var(--primary-600);
}

.hard-deleted {
  color: var(--light);
  background-color: var(--error);
}

.soft-deleted {
  color: var(--secondary-600);
  background-color: var(--secondary-200);
}

.dark .soft-deleted {
  color: var(--secondary-200);
  background-color: var(--secondary-500);
}

.event-group {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.event-group h4 {
  font-size: var(--fs-sm);
  font-weight: normal;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.hidden {
  display: none;
}

#activity-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  font-size: var(--fs-sm);
  color: var(--text-muted);
}

#no-activity-icon-wrapper {
  border-radius: 60% 45% 55% 45% / 55% 45% 60% 40%;
  background-color: var(--secondary-100);
  padding: var(--space-4) var(--space-10);
}

.dark #no-activity-icon-wrapper {
  background-color: var(--secondary-500);
}

#no-activity-icon {
  width: 100%;
  height: 95px;
  object-fit: contain;
}

@media (min-width: 1024px) {
  #recent-actions-section {
    width: 650px;
  }

  #recent-actions-container {
    max-height: 40vh;
  }
}
</style>
