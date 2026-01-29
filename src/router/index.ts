import { createRouter, createWebHistory } from "vue-router";

import RootView from "../views/RootView.vue";

interface Route {
  path: string;
  component: any;
  [key: string]: any;
}

const routes: Route[] = [
  {
    path: "/",
    component: RootView,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
