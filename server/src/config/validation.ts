import { z } from 'zod';
import { FileType } from '../models/File';

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100)
});

export const registerSchema = loginSchema;

export const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.number().nullable()
});

export const fileFilterSchema = z.object({
  parentId: z.string().optional(),
  type: z.nativeEnum(FileType).optional(),
  search: z.string().optional()
}); 