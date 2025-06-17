export enum FileType {
  FOLDER = 'folder',
  TEXT = 'text',
  PDF = 'pdf',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other'
}

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: number;
  mimeType?: string;
  content?: string;
  url?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileStats {
  type: FileType;
  count: number;
  totalSize: number;
}

export interface ApiResponse<T> {
  error?: string;
  data?: T;
  content?: T;
  url?: string;
}

export interface TextContent {
  content: string;
}

export interface FileIcon {
  [FileType.FOLDER]: string;
  [FileType.TEXT]: string;
  [FileType.PDF]: string;
  [FileType.IMAGE]: string;
  [FileType.VIDEO]: string;
  [FileType.AUDIO]: string;
  [FileType.DOCUMENT]: string;
  [FileType.OTHER]: string;
} 