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

const SEED_USERS: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
  role: PGUser['role'];
  username?: string;
}> = [
  {
    id: 'usr-mayank-bisht',
    email: 'mayank.bisht@offgridstudio.in',
    password: 'REDACTED_SEED_PASSWORD',
    name: 'Mayank Bisht',
    role: 'ADMIN',
  },
  {
    id: 'usr-siddharth',
    email: 'siddharth@offgridstudio.in',
    password: 'REDACTED_SEED_PASSWORD',
    name: 'Siddharth',
    role: 'DESIGNER',
    username: 'siddharth',
  },
  {
    id: 'usr-ayush-anand',
    email: 'ayush.anand@offgridstudio.in',
    password: 'REDACTED_SEED_PASSWORD',
    name: 'Ayush Anand',
    role: 'DESIGNER',
    username: 'ayush_anand',
  },
  {
    id: 'usr-dhruv-sharma',
    email: 'dhruv.sharma@offgridstudio.in',
    password: 'REDACTED_SEED_PASSWORD',
    name: 'Dhruv Sharma',
    role: 'MANUFACTURER',
    username: 'dhruv_sharma',
  },
  {
    id: 'usr-marketing',
    email: 'marketing@offgridstudio.in',
    password: 'REDACTED_SEED_PASSWORD',
    name: 'Marketing',
    role: 'ADMIN',
    username: 'marketing',
  },
];

export async function initDb() {
  console.log('Initializing Neon PostgreSQL Database with Prisma...');
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

    for (const seed of SEED_USERS) {
      await prisma.user.upsert({
        where: { email: seed.email },
        update: {
          password: seed.password,
          name: seed.name,
          role: seed.role,
          username: seed.username ?? null,
        },
        create: {
          id: seed.id,
          email: seed.email,
          password: seed.password,
          name: seed.name,
          role: seed.role,
          username: seed.username ?? null,
        },
      });
    }

    const count = await prisma.user.count();
    console.log(`Seeded admin/demo users ensured. offgrid_users currently has ${count} rows.`);
  } catch (error) {
    console.error('Failed to initialize Neon PostgreSQL database:', error);
  }
}
