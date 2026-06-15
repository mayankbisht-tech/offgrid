/**
 * PostgreSQL connection pool singleton.
 * Import `pool` from here — never instantiate pg.Pool elsewhere.
 * NOTE: dotenv must be loaded before this module is imported (done in server.ts).
 */
import pg from 'pg';

const { Pool } = pg;

// At module load time, DATABASE_URL must already be in process.env.
// server.ts calls dotenv.config() before importing this.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[db] FATAL: DATABASE_URL is not set. Add it to your .env file.');
  process.exit(1);
}

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});
