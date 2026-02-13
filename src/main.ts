import { createApp } from "vue";
import "./styles/main.css";
import "./styles/components.css";
import "./styles/utils.css";
import App from "./App.vue";
import { router } from "./router";
import { createPinia } from "pinia";

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.mount("#app");
