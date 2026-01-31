<template>
  <div id="home-layout">
    <header>
      <h1>¡Bienvenido de nuevo!</h1>
    </header>
    <section class="home-section">
      <h2>Acciones rápidas</h2>
      <div class="quick-action-btns">
        <button class="btn-primary"><FilePlusCorner /> Crear nota</button>
        <button class="btn-secondary"><FolderPlus /> Crear colección</button>
      </div>
    </section>
    <section class="home-section">
      <!-- TODO: Add recent actions-->
      <h2>Actividad reciente</h2>
      <div id="recent-actions-container">
        <ul id="recent-actions-list">
          <li>
            <p class="action-date">20/10/2025</p>
            <p>Ejemplo 1</p>
          </li>
          <li>
            <p class="action-date">21/10/2025</p>
            <p>Ejemplo 2</p>
          </li>
          <li>
            <p class="action-date">22/10/2025</p>
            <p>Ejemplo 3</p>
          </li>
        </ul>
      </div>
    </section>
    <section class="home-section">
      <h2 id="temporary-notes-h2">Notas temporales</h2>
      <p>Cree notas únicas que se desvanecerán cuando usted lo decida.</p>
      <button class="btn-secondary">
        <FilePlusCorner /> Crear nota temporal
      </button>
      <div class="notes-grid">
        <div>Note 1</div>
        <div>Note 2</div>
        <div>Note 3</div>
        <div>Note 4</div>
        <div>note 5</div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { FilePlusCorner, FolderPlus } from "lucide-vue-next";
</script>
<style scoped>
h1 {
  font-size: var(--fs-2xl);
  margin-bottom: var(--space-8);
}

h2 {
  font-size: var(--fs-lg);
  margin-bottom: var(--space-4);
}

#temporary-notes-h2 {
  margin-bottom: var(--space-1);
}

#temporary-notes-h2 + p {
  margin-bottom: var(--space-4);
  color: var(--text-muted);
}

#home-layout {
  display: flex;
  flex-direction: column;
}
.quick-action-btns {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  justify-items: center;
  flex-wrap: wrap;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-4);
  background-color: var(--primary-500);
  color: var(--light);
  border: 2px solid var(--primary-500);
  border-radius: var(--rounded-md);
  font-size: var(--fs-sm);
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--primary-600);
}

.btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-1) var(--space-4);
  border-radius: var(--rounded-md);
  border: 2px solid var(--secondary-300);
  font-size: var(--fs-sm);
  font-weight: 600;
  transition: background-color 0.2s ease;
  color: var(--secondary-400);
}

.dark .btn-secondary {
  color: var(--secondary-200);
}

.dark .btn-secondary:hover {
  background-color: var(--secondary-500);
}

.btn-secondary:hover {
  background-color: var(--secondary-100);
}

.home-section {
  margin-bottom: var(--space-8);
  width: 100%;
}

.action-date {
  color: var(--text-muted);
  font-size: var(--fs-sm);
}

#recent-actions-container {
  background-color: var(--bg);
  padding: var(--space-4);
  border-radius: var(--rounded-md);
  border: 1.5px solid var(--border);
  width: 100%;
  box-shadow: var(--shadow-sm);
}

#recent-actions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  list-style: none;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-top: var(--space-6);
}
.notes-grid div {
  background-color: aquamarine;
}

@media (min-width: 768px) {
  #recent-actions-container {
    max-width: 650px;
  }
  .notes-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-8);
  }
}
</style>
