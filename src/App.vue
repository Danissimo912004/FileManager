<template>
  <div id="app">
    <MainNavigation />
    <router-view v-if="isReady" />
    <div v-else class="loading">
      Loading...
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import type { AuthStore } from './types/store';
import MainNavigation from './components/MainNavigation.vue';

export default defineComponent({
  name: 'App',

  components: {
    MainNavigation
  },

  setup() {
    const authStore = useAuthStore() as AuthStore;
    const isReady = ref(false);

    onMounted(async () => {
      await authStore.checkAuth();
      isReady.value = true;
    });

    return {
      isReady
    };
  }
});
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
    'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background: #f8f9fa;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.25rem;
  color: #6c757d;
}
</style> 