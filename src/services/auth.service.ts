import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';
import { api } from './api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const { user, token } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', credentials);
      const { user, token } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Auth check error:', error);
      throw error;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}; 
