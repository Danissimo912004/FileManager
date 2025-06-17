import type { SystemStats, User, Log, PaginatedResponse, ApiResponse } from '@/types/admin';
import { FileItem } from '@/types/types';
import { api } from './api';

class AdminService {
  async getStats(): Promise<ApiResponse<SystemStats>> {
    try {
      const response = await api.get('/admin/stats');
      return { data: response.data };
    } catch (error) {
      return { data: { totalUsers: 0, totalFiles: 0, totalSize: 0, fileTypes: [] }, error: this.getErrorMessage(error) };
    }
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await api.get('/admin/users');
      return { data: response.data };
    } catch (error) {
      return { data: [], error: this.getErrorMessage(error) };
    }
  }

  async getLogs(): Promise<ApiResponse<FileItem[]>> {
    try {
      const response = await api.get("/admin/logs");
      return { data: response.data };
    } catch (error) {
      return { 
        data: [], 
        error: this.getErrorMessage(error) 
      };
    }
  }

  async updateUser(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await api.put(`/admin/users/${userId}`, data);
      return { data: response.data };
    } catch (error) {
      return { data: {} as User, error: this.getErrorMessage(error) };
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/admin/users/${userId}`);
      return { data: undefined };
    } catch (error) {
      return { data: undefined, error: this.getErrorMessage(error) };
    }
  }

  private getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return error.message || 'An error occurred';
  }
}

export const adminService = new AdminService(); 
