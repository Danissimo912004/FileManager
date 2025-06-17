import path from 'path';
import fs from 'fs';

// Базовые пути
export const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
export const TEMP_DIR = path.join(__dirname, '..', 'temp');

// Настройки файлов
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Разрешенные типы файлов
export const ALLOWED_FILE_TYPES = [
  // Текстовые файлы
  '.txt', '.md', '.json', '.js', '.ts', '.html', '.css',
  // PDF
  '.pdf',
  // Изображения
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  // Видео
  '.mp4', '.webm', '.avi',
  // Аудио
  '.mp3', '.wav', '.ogg'
] as const;

// Создаем директории, если они не существуют
[UPLOAD_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}); 