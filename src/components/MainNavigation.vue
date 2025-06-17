<template>
  <nav class="navigation">
    <router-link to="/" class="nav-brand">File Manager</router-link>
    
    <div class="nav-links">
      <router-link to="/" class="nav-link">Home</router-link>
      
      <template v-if="user">
        <router-link v-if="user.isAdmin" to="/admin" class="nav-link">Admin Panel</router-link>
        <button @click="handleLogout" class="nav-link logout-btn">
          Logout ({{ user.username }})
        </button>
      </template>
      
      <router-link v-else to="/login" class="nav-link">Login</router-link>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth.service';
import type { User } from '../types/auth';

export default defineComponent({
  name: 'MainNavigation',
  setup() {
    const router = useRouter();
    const user = ref<User | null>(null);

    const loadUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        user.value = JSON.parse(userStr);
      }
    };

    const handleLogout = async () => {
      try {
        await authService.logout();
        localStorage.removeItem('user');
        user.value = null;
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    onMounted(() => {
      loadUser();
      window.addEventListener('storage', loadUser);
    });

    return {
      user,
      handleLogout,
    };
  },
});
</script>

<style scoped>
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.nav-brand {
  font-size: 1.25rem;
  font-weight: bold;
  text-decoration: none;
  color: #333;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #e9ecef;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
}

.logout-btn:hover {
  color: #dc3545;
}
</style> 