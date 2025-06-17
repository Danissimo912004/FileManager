import { FileType } from './types';

export const ALLOWED_FILE_TYPES = {
  TEXT: ['.txt', '.md', '.json', '.js', '.ts', '.html', '.css'] as const,
  PDF: ['.pdf'] as const,
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'] as const,
  VIDEO: ['.mp4', '.webm', '.avi'] as const,
  AUDIO: ['.mp3', '.wav', '.ogg'] as const
} as const;

type AllowedExtension = typeof ALLOWED_FILE_TYPES[keyof typeof ALLOWED_FILE_TYPES][number];
export const ALL_ALLOWED_EXTENSIONS = Object.values(ALLOWED_FILE_TYPES).flat() as readonly AllowedExtension[];

export const getFileTypeFromExtension = (extension: string): FileType => {
  const lowerExt = extension.toLowerCase();
  
  for (const [type, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
    if ((extensions as readonly string[]).includes(lowerExt)) {
      return FileType[type as keyof typeof FileType];
    }
  }
  
  return FileType.OTHER;
};

export const isAllowedFileType = (extension: string): boolean => {
  const lowerExt = extension.toLowerCase();
  return (ALL_ALLOWED_EXTENSIONS as readonly string[]).includes(lowerExt);
}; 