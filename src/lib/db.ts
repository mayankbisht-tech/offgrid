/**
 * PostgreSQL connection pool singleton.
 * Import `pool` from here — never instantiate pg.Pool elsewhere.
 */
import pg from 'pg';

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  (() => {
    console.warn('[db] DATABASE_URL is not set — using fallback. Set it in .env for production.');
    return '';
  })();

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
