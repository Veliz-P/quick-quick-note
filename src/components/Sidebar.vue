<template>
  <nav id="sidebar-desktop" class="dark">
    <div id="logo-box">
      <img src="/public/logo.png" alt="quick quick note logo" id="logo" />
      <p>quick quick note</p>
    </div>

    <ul id="links">
      <router-link to="/home"
        ><li class="link-item">
          <Home />
          Inicio
        </li></router-link
      >
      <router-link to="/collections">
        <li class="link-item">
          <NotebookPen />
          Colecciones y <br />
          notas
        </li>
      </router-link>
      <!-- <router-link to="/">
        <li class="link-item">
          <Trash2 />
          Papelera
        </li>
      </router-link>
      <router-link to="/">
        <li class="link-item">
          <Info />
          App Info
        </li>
      </router-link> -->
    </ul>

    <!-- <router-link to="/" id="settings">
      <div class="link-item">
        <Settings />
        Ajustes
      </div>
    </router-link> -->
  </nav>

  <nav id="sidebar-mobile">
    <div id="logo-box">
      <img src="/public/logo.png" alt="quick quick note logo" id="logo" />
      <p>quick quick note</p>
    </div>
    <button id="open-menu-btn" @click="isMenuOpen = !isMenuOpen">
      <MenuIcon />
    </button>

    <ul
      v-if="isMenuOpen"
      id="links-mobile"
      :class="isMenuOpen ? 'slide-down' : ''"
    >
      <li>
        <button @click="closeMenu" id="close-menu-btn">
          <ChevronUp />
        </button>
      </li>
      <router-link to="/home" @click="closeMenu">
        <li class="link-item">
          <Home />
          Inicio
        </li>
      </router-link>
      <router-link to="/collections" @click="closeMenu">
        <li class="link-item">
          <NotebookPen />
          Colecciones y notas
        </li>
      </router-link>
      <!-- <router-link to="/" @click="closeMenu">
        <li class="link-item">
          <Trash2 />
          Papelera
        </li>
      </router-link>
      <router-link to="/" @click="closeMenu">
        <li class="link-item">
          <Info />
          App Info
        </li>
      </router-link>
      <router-link to="/" @click="closeMenu">
        <li>
          <button id="settings-btn-mobile"><Settings /> Ajustes</button>
        </li>
      </router-link> -->
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Home,
  NotebookPen,
  Info,
  Trash2,
  Settings,
  MenuIcon,
  ChevronUp,
} from "lucide-vue-next";

const isMenuOpen = ref(false);

const closeMenu = () => (isMenuOpen.value = false);
</script>

<style scoped>
#sidebar-desktop {
  display: none;
}
#sidebar-mobile {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  background-color: var(--secondary-600);
  color: var(--sidebar-text);
  padding: var(--space-2) var(--space-4);
}
.dark #sidebar-mobile {
  background-color: var(--secondary-800);
}
#logo-box {
  display: flex;
  align-items: center;
  font-size: var(--fs-md);
  font-weight: bold;
  text-align: center;
  gap: var(--space-4);
  text-transform: capitalize;
}

#logo {
  width: 45px;
  height: auto;
  aspect-ratio: 1/1;
  object-fit: contain;
  margin: auto;
}

#open-menu-btn,
#close-menu-btn {
  color: var(--sidebar-text);
  border-radius: var(--rounded-md);
  padding: var(--space-1) var(--space-2);
  transition: background-color 0.2s ease;
}

#close-menu-btn {
  border-radius: var(--rounded-full);
  background-color: var(--secondary-500);
}

#open-menu-btn:hover {
  background-color: var(--secondary-800);
}

#open-menu-btn:hover,
#close-menu-btn:hover {
  color: var(--primary-400);
  background-color: var(--secondary-500);
}

.dark #open-menu-btn:hover {
  color: var(--primary-400);
  background-color: var(--secondary-600);
}

#links-mobile {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--secondary-600);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-5);
  list-style: none;
  border-top: 1px solid var(--sidebar-border);
}

#links-mobile a {
  color: var(--sidebar-text);
}

.dark #links-mobile {
  background-color: var(--secondary-800);
}

.link-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  border-radius: var(--rounded-md);
  padding: var(--space-1) var(--space-2);
  transition: background-color 0.2s ease;
}

.link-item:hover {
  color: var(--primary-400);
  background-color: var(--secondary-500);
}
.dark #sidebar-mobile .link-item:hover {
  color: var(--primary-400);
  background-color: var(--secondary-600);
}

#settings-btn-mobile {
  background-color: var(--primary-600);
  width: 100%;
  color: var(--sidebar-text);
  border-radius: var(--rounded-lg);
  padding: var(--space-2) var(--space-4);
  text-transform: uppercase;
  display: flex;
  place-items: center;
  place-content: center;
  gap: var(--space-2);
  transition: background-color 0.2s ease;
}

#settings-btn-mobile:hover {
  background-color: var(--primary-500);
}

@media (min-width: 768px) {
  #sidebar-mobile {
    display: none;
  }

  #sidebar-desktop {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    width: 100%;
    height: 100%;
    justify-content: space-between;
    background-color: var(--secondary-600);
    color: var(--sidebar-text);
    overflow: auto;
    overflow-x: hidden;
    border-right: 1px solid var(--border);
  }
  .dark #sidebar-desktop {
    background-color: var(--secondary-800);
  }

  #logo {
    margin-top: var(--space-6);
  }

  #logo-box {
    display: flex;
    flex-direction: column;
  }

  #links {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    width: 100%;
    padding: var(--space-4) var(--space-6);
    text-decoration: none;
  }

  #settings {
    padding: var(--space-6);
    width: 100%;
    border-top: 1.5px solid var(--light);
  }

  #settings:hover a {
    color: var(--primary-400);
    background-color: var(--secondary-500);
  }

  .dark #sidebar-desktop .link-item:hover {
    color: var(--primary-400);
    background-color: var(--secondary-600);
  }
}

@keyframes slide-down {
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0);
  }
}

.slide-down {
  animation: slide-down 1s ease;
}
</style>
