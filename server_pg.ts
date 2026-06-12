import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "";

// Ensure the connection uses SSL as required by Neon
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export interface PGUser {
  id: string;
  email: string;
  password_hash: string; // Storing as direct string comparison for this seamless sandbox execution
  name: string;
  role: 'CONSUMER' | 'DESIGNER' | 'MANUFACTURER';
  username?: string;
  created_at?: Date;
}

/**
 * Initializes the Postgres database and seeds the designer, manufacturer, and user credentials.
 */
export async function initDb() {
  console.log('Initializing Neon PostgreSQL Database...');
  const client = await pool.connect();
  try {
    // 1. Create table if not exists
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

    // 2. Check if users are seeded
    const { rows } = await client.query('SELECT COUNT(*) FROM offgrid_users');
    const count = parseInt(rows[0].count, 10);
    
    if (count === 0) {
      console.log('Seeding login credentials to Neon PostgreSQL...');
      
      const seedUsers = [
        {
          id: 'usr-1',
          email: 'karan@offgrid.in',
          password: 'password123',
          name: 'Karan Singh',
          role: 'DESIGNER',
          username: 'karan_singh'
        },
        {
          id: 'usr-2',
          email: 'anusha@offgrid.in',
          password: 'password123',
          name: 'Anusha Rao',
          role: 'DESIGNER',
          username: 'anusha_rao'
        },
        {
          id: 'usr-4',
          email: 'mumbai@offgrid.in',
          password: 'password123',
          name: 'Om Shanti Printworks',
          role: 'MANUFACTURER',
          username: undefined
        },
        {
          id: 'usr-5',
          email: 'deccan@offgrid.in',
          password: 'password123',
          name: 'Deccan Weaver Labs',
          role: 'MANUFACTURER',
          username: undefined
        },
        {
          id: 'usr-6',
          email: 'mayankbisht1107@gmail.com',
          password: 'password123',
          name: 'Mayank Bisht',
          role: 'CONSUMER',
          username: undefined
        }
      ];

      for (const u of seedUsers) {
        await client.query(
          `INSERT INTO offgrid_users (id, email, password, name, role, username) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (email) DO NOTHING`,
          [u.id, u.email, u.password, u.name, u.role, u.username]
        );
      }
      console.log('Neon PostgreSQL database pre-seeded successfully!');
    } else {
      console.log(`Database already has ${count} users seeded.`);
    }
  } catch (error) {
    console.error('Failed to initialize Neon PostgreSQL database:', error);
  } finally {
    client.release();
  }
}
