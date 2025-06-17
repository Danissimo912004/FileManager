export enum FileType {
  TEXT = 'text',
  PDF = 'pdf',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other'
}

export interface FileItem {
  id: string;
  filename: string;
  originalname: string;
  type: FileType;
  size: number;
  createdAt: Date;
  updatedAt: Date;
} 