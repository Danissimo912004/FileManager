import { User, UserAttributes } from '../models/User';
import { sequelize } from './database';

export async function initializeDatabase() {
  try {
    // Sync database
    await sequelize.sync({ force: true }); // This will recreate all tables
    console.log('Database synced successfully');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      password: 'admin123',
      isAdmin: true
    } as UserAttributes);

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      username: adminUser.username,
      isAdmin: adminUser.isAdmin
    });

    // Create test user
    const testUser = await User.create({
      username: 'user',
      password: 'user123',
      isAdmin: false
    } as UserAttributes);

    console.log('Test user created successfully:', {
      id: testUser.id,
      username: testUser.username,
      isAdmin: testUser.isAdmin
    });

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
} 