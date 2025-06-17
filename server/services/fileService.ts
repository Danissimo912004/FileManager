import path from 'path';
import fs from 'fs';
import { FileType } from '../types/types';
import { getFileById } from '../models/file';
import { UPLOAD_DIR } from '../config';

export interface FileContentResponse {
  content?: string | Buffer;
  error?: string;
}

export const getFileContent = async (fileId: string): Promise<FileContentResponse> => {
  try {
    const file = await getFileById(fileId);
    if (!file) {
      return { error: 'File not found' };
    }

    const filePath = path.join(UPLOAD_DIR, file.filename);
    
    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      return { error: 'File does not exist on disk' };
    }
    
    // Для текстовых файлов возвращаем содержимое напрямую
    if (file.type === FileType.TEXT) {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return { content };
    }

    // Для бинарных файлов возвращаем буфер
    const buffer = await fs.promises.readFile(filePath);
    return { content: buffer };
  } catch (error) {
    console.error('Error getting file content:', error);
    return { error: error instanceof Error ? error.message : 'Failed to get file content' };
  }
}; 