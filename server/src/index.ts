import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { config } from './config/config';
import swaggerUi from 'swagger-ui-express';
import { fileRouter } from './routes/file.routes';
import { authRouter } from './routes/auth.routes';
import { adminRouter } from './routes/admin.routes';
import { errorHandler } from './middleware/error.middleware';
import { initDatabase } from './config/database';
import { initializeDatabase } from './config/initDb';
import { swaggerSpec } from './config/swagger';
import { FileService } from './services/fileService';

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(cookieParser());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/files', fileRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// Error handling
app.use(errorHandler);

// Initialize database and start server
async function start() {
  try {
    // Initialize database with admin user
    await initializeDatabase();
    
    // Initialize file service
    await FileService.init();
    
    // Sync files with database
    await FileService.syncDirectory();

    const port = config.port;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

start(); 