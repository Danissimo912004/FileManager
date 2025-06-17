import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.VUE_APP_API_URL || '/api';
axios.defaults.withCredentials = true;

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app'); 