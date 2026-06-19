import { prisma } from './src/lib/prisma.js';

export { prisma };

export interface PGUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'CONSUMER' | 'DESIGNER' | 'MANUFACTURER' | 'ADMIN';
  username?: string;
  created_at?: Date;
}

export async function initDb() {
  console.log('Initializing PostgreSQL database with Prisma...');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS offgrid_users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        username VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "offgrid_users" checked/created.');
  } catch (error) {
    console.error('Failed to initialize Neon PostgreSQL database:', error);
  }
}
