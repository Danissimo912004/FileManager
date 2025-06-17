import dotenv from 'dotenv';

dotenv.config();

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Cookie configuration
export const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key') {
  console.warn('Warning: Using default JWT secret in production environment!');
} 