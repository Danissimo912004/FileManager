import { Sequelize } from 'sequelize';
import path from 'path';
import { File } from '../models/File';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Import models
    await Promise.all([
      import('../models/File'),
      // Add other models here if needed
    ]);
    
    // Sync all models
    await sequelize.sync({ force: true }); // Using force:true to recreate tables
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
} 
