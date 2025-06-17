import { FileType, FileItem } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { UPLOAD_DIR } from '../config';
import { isAllowedFileType, getFileTypeFromExtension } from '../types/fileTypes';

const files: FileItem[] = [];

export const getFileById = async (id: string): Promise<FileItem | undefined> => {
  return files.find(file => file.id === id);
};

export const createFile = async (file: Express.Multer.File): Promise<FileItem> => {
  const id = uuidv4();
  const extension = path.extname(file.originalname).toLowerCase();
  
  // Проверяем, разрешен ли тип файла
  if (!isAllowedFileType(extension)) {
    throw new Error(`File type ${extension} is not allowed`);
  }
  
  // Определяем тип файла на основе расширения
  const type = getFileTypeFromExtension(extension);

  const newFile: FileItem = {
    id,
    filename: file.filename,
    originalname: file.originalname,
    type,
    size: file.size,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  files.push(newFile);
  return newFile;
};

export const updateFile = async (id: string, content: string): Promise<FileItem | undefined> => {
  const file = await getFileById(id);
  if (!file) return undefined;

  const filePath = path.join(UPLOAD_DIR, file.filename);
  await fs.promises.writeFile(filePath, content, 'utf8');
  
  file.updatedAt = new Date();
  return file;
}; 