import axios from 'axios';
import type { FileItem, FileStats, FileType, ApiResponse, TextContent } from '@/types/types';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Basic error handler
const handleError = (error: unknown, defaultMessage: string) => {
  console.error(defaultMessage, error);
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return { error: error.response.data.message };
  }
  return { error: error instanceof Error ? error.message : defaultMessage };
};

// File retrieval operations
export const getFiles = async (folderId?: string): Promise<ApiResponse<FileItem[]>> => {
  try {
    const response = await api.get<FileItem[]>('/files', {
      params: { folderId }
    });
    return { data: response.data };
  } catch (error) {
    return handleError(error, 'Failed to get files');
  }
};

export const getFileById = async (fileId: string): Promise<ApiResponse<FileItem>> => {
  try {
    const response = await api.get<FileItem>(`/files/${fileId}`);
    return { data: response.data };
  } catch (error) {
    return handleError(error, 'Failed to get file');
  }
};

// File content operations
export const getFileContent = async (fileId: string): Promise<ApiResponse<TextContent>> => {
  try {
    const response = await api.get<TextContent>(`/files/${fileId}/content`);
    return { content: response.data };
  } catch (error) {
    return handleError(error, 'Failed to get file content');
  }
};

export const updateFileContent = async (fileId: string, content: string): Promise<ApiResponse<void>> => {
  try {
    await api.put(`/files/${fileId}/content`, { content });
    return {};
  } catch (error) {
    return handleError(error, 'Failed to update file content');
  }
};

// File management operations
export const uploadFile = async (file: File, parentId?: string): Promise<ApiResponse<FileItem>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) {
      formData.append('parentId', parentId);
    }

    const response = await api.post<FileItem>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { data: response.data };
  } catch (error) {
    return handleError(error, 'Failed to upload file');
  }
};

export const createFolder = async (name: string, parentId?: string): Promise<ApiResponse<FileItem>> => {
  try {
    const response = await api.post<FileItem>('/files/folder', {
      name,
      parentId,
    });
    return { data: response.data };
  } catch (error) {
    return handleError(error, 'Failed to create folder');
  }
};

export const deleteFile = async (fileId: string): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/files/${fileId}`);
    return {};
  } catch (error) {
    return handleError(error, 'Failed to delete file');
  }
};

// Search and statistics
export const searchFiles = async (query: string): Promise<ApiResponse<FileItem[]>> => {
  try {
    const response = await api.get<FileItem[]>('/files/search', {
      params: { query }
    });
    return { data: response.data };
  } catch (error) {
    return handleError(error, 'Failed to search files');
  }
};

export const getFileStats = async (): Promise<ApiResponse<FileStats[]>> => {
  try {
    const response = await api.get<FileStats[]>('/files/stats');
    return { data: response.data };
  } catch (error) {
    return handleError(error, 'Failed to fetch file statistics');
  }
};

export const downloadFile = async (fileId: string): Promise<ApiResponse<Blob>> => {
  try {
    const response = await api.get(`/files/download/${fileId}`, {
      responseType: 'blob'
    });
    return { data: response.data };
  } catch (error) {
    return handleError(error, 'Failed to download file');
  }
};

export const syncFiles = async (): Promise<ApiResponse<void>> => {
  try {
    await api.post('/files/sync');
    return {};
  } catch (error) {
    return handleError(error, 'Failed to sync files');
  }
}; 
