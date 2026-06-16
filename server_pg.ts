import { pool } from './src/lib/db.js';

export { pool };

export interface PGUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'CONSUMER' | 'DESIGNER' | 'MANUFACTURER';
  username?: string;
  created_at?: Date;
}

export async function initDb() {
  console.log('Initializing Neon PostgreSQL Database...');
  const client = await pool.connect();
  try {
    await client.query(`
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

    const { rows } = await client.query('SELECT COUNT(*) FROM offgrid_users');
    const count = parseInt(rows[0].count, 10);
    console.log(`Database ready. offgrid_users currently has ${count} rows and no demo seed data is added.`);
  } catch (error) {
    console.error('Failed to initialize Neon PostgreSQL database:', error);
  } finally {
    client.release();
  }
}
