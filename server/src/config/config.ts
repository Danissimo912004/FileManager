import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  database: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../data/database.sqlite'),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  fileStorage: {
    path: path.join(__dirname, '../../data/files'),
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      'image/*',
      'application/pdf',
      'text/*',
      'application/msword',
      'video/*',
      'audio/*',
      'application/vnd.openxmlformats-officedocument.*'
    ],
  },
};

export { config }; 