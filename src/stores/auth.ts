import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.isAdmin || false
  },

  actions: {
    async login(username: string, password: string) {
      try {
        const response = await axios.post('/api/auth/login', {
          username,
          password
        });

        const { user, token } = response.data;
        this.user = user;
        this.token = token;
        localStorage.setItem('token', token);
        
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },

    async logout() {
      try {
        await axios.post('/api/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    },

    async checkAuth() {
      try {
        if (!this.token) return false;

        const response = await axios.get('/api/auth/me');
        this.user = response.data.user;
        return true;
      } catch (error) {
        console.error('Auth check error:', error);
        this.logout();
        return false;
      }
    }
  }
}); 