export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface FileTypeStats {
  type: string;
  count: number;
  size: number;
}

export interface SystemStats {
  totalUsers: number;
  totalFiles: number;
  totalSize: number;
  fileTypes: FileTypeStats[];
}

export interface Log {
  id: string;
  action: string;
  username: string;
  details: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
} 