export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface File {
  id: string;
  name: string;
  type: FileType;
  path: string;
  size: number;
  mimeType?: string;
  content?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum FileType {
  FOLDER = 'folder',
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  OTHER = 'other'
}

export interface SystemStats {
  totalUsers: number;
  totalFiles: number;
  totalSize: number;
  fileTypes: Array<{
    type: FileType;
    count: number;
    size: number;
  }>;
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
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
} 