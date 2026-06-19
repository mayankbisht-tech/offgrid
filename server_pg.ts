import { prisma } from './src/lib/prisma.js';
import { serverEnv } from './src/config/env.js';

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
  name: string;
  role: PGUser['role'];
  username?: string;
  passwordEnvKey: keyof typeof serverEnv;
}> = [
  {
    id: 'usr-mayank-bisht',
    email: 'mayank.bisht@offgridstudio.in',
    name: 'Mayank Bisht',
    role: 'ADMIN',
    passwordEnvKey: 'SEED_MAYANK_PASSWORD',
  },
  {
    id: 'usr-siddharth',
    email: 'siddharth@offgridstudio.in',
    name: 'Siddharth',
    role: 'DESIGNER',
    username: 'siddharth',
    passwordEnvKey: 'SEED_SIDDHARTH_PASSWORD',
  },
  {
    id: 'usr-ayush-anand',
    email: 'ayush.anand@offgridstudio.in',
    name: 'Ayush Anand',
    role: 'DESIGNER',
    username: 'ayush_anand',
    passwordEnvKey: 'SEED_AYUSH_PASSWORD',
  },
  {
    id: 'usr-dhruv-sharma',
    email: 'dhruv.sharma@offgridstudio.in',
    name: 'Dhruv Sharma',
    role: 'MANUFACTURER',
    username: 'dhruv_sharma',
    passwordEnvKey: 'SEED_DHRUV_PASSWORD',
  },
  {
    id: 'usr-marketing',
    email: 'marketing@offgridstudio.in',
    name: 'Marketing',
    role: 'ADMIN',
    username: 'marketing',
    passwordEnvKey: 'SEED_MARKETING_PASSWORD',
  },
];

export async function initDb() {
  console.log('Initializing Neon PostgreSQL Database with Prisma...');
  try {
    const seedPasswords = Object.fromEntries(
      SEED_USERS.map((user) => {
        const password = serverEnv[user.passwordEnvKey];
        if (!password) {
          throw new Error(
            `[db] Missing required demo credential env var: ${user.passwordEnvKey}`
          );
        }
        return [user.id, password] as const;
      })
    ) as Record<string, string>;

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
          password: seedPasswords[seed.id],
          name: seed.name,
          role: seed.role,
          username: seed.username ?? null,
        },
        create: {
          id: seed.id,
          email: seed.email,
          password: seedPasswords[seed.id],
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
