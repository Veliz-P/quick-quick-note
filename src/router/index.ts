import { createRouter, createWebHashHistory } from "vue-router";

import RootView from "../views/RootView.vue";
import HomeView from "../views/HomeView.vue";
import CollectionView from "../views/CollectionView.vue";
interface Route {
  path: string;
  name: string;
  component: any;
  [key: string]: any;
}

const routes: Route[] = [
  {
    path: "/",
    name: "root",
    redirect: "/home",
    component: RootView,
    children: [
      {
        path: "home",
        component: HomeView,
      },
      {
        path: "collections",
        component: CollectionView,
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
