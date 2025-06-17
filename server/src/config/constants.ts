import path from 'path';
import { config } from './config';

export const JWT_SECRET = config.jwtSecret;
export const JWT_EXPIRES_IN = '24h';
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 1000; // 1 hour in milliseconds
export const REFRESH_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const UPLOAD_DIR = config.fileStorage.path;
export const MAX_FILE_SIZE = config.fileStorage.maxSize;
export const ALLOWED_FILE_TYPES = config.fileStorage.allowedTypes;

export const ERROR_MESSAGES = {
  FILE_NOT_FOUND: 'File not found',
  FOLDER_NOT_FOUND: 'Folder not found',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds limit',
  FOLDER_NAME_REQUIRED: 'Folder name is required',
  NO_FILE_UPLOADED: 'No file uploaded',
  CANNOT_DELETE_ROOT: 'Cannot delete root folder',
  CANNOT_MOVE_TO_CHILD: 'Cannot move folder to its child',
  INVALID_DESTINATION: 'Invalid destination folder',
  DUPLICATE_NAME: 'File or folder with this name already exists',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden action',
  INTERNAL_ERROR: 'Internal server error'
}; 
