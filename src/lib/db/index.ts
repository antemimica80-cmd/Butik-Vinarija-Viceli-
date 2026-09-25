import 'server-only';
import { dataDir } from '@/lib/site-url';

/**
 * Database access. Production: Postgres via DATABASE_URL (e.g. Neon from the
 * Vercel Marketplace). Local / proposal: an embedded Postgres (PGlite) stored in
 * .data/pglite — no setup needed. Both speak the same SQL.
 */
export type Query = <T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T[]>;
type Driver = { query: Query; tx: <T>(fn: (q: Query) => Promise<T>) => Promise<T> };

const SCHEMA = `
CREATE TABLE IF NOT EXISTS bookings (
  id text PRIMARY KEY,
  token text NOT NULL,
  experience text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  slot_key text NOT NULL,
  adults integer NOT NULL,
  children integer NOT NULL DEFAULT 0,
  guests integer NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  locale text NOT NULL DEFAULT 'en',
  status text NOT NULL,
  hold_expires_at timestamptz,
  stripe_session_id text,
  payment_mode text NOT NULL DEFAULT 'demo',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  emails_sent_at timestamptz
);
CREATE INDEX IF NOT EXISTS bookings_slot_idx ON bookings (slot_key, status);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings (date);
CREATE TABLE IF NOT EXISTS blocked (
  key text PRIMARY KEY,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  token text NOT NULL,
  lines jsonb NOT NULL,
  bottles jsonb NOT NULL,
  subtotal_cents integer NOT NULL,
  shipping_cents integer NOT NULL,
  total_cents integer NOT NULL,
  vat_cents integer NOT NULL,
  zone text NOT NULL,
  country text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  address jsonb NOT NULL,
  notes text NOT NULL DEFAULT '',
  locale text NOT NULL DEFAULT 'en',
  status text NOT NULL,
  stock_ok boolean,
  stripe_session_id text,
  payment_mode text NOT NULL DEFAULT 'demo',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  emails_sent_at timestamptz
);
CREATE TABLE IF NOT EXISTS stock (
  wine text PRIMARY KEY,
  bottles integer NOT NULL CHECK (bottles >= 0)
);
CREATE TABLE IF NOT EXISTS enquiries (
  id text PRIMARY KEY,
  kind text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

async function createDriver(): Promise<Driver> {
  const url = process.env.DATABASE_URL;
  if (url && !url.includes('...')) {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: url, max: 3 });
    const query: Query = async (sql, params) => (await pool.query(sql, params as unknown[])).rows;
    await pool.query(SCHEMA);
    return {
      query,
      tx: async (fn) => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const result = await fn(async (sql, params) => (await client.query(sql, params as unknown[])).rows);
          await client.query('COMMIT');
          return result;
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        } finally {
          client.release();
        }
      },
    };
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const dir = process.env.PGLITE_DIR ?? `${dataDir()}/pglite`;
  if (dir !== 'memory') await (await import('node:fs/promises')).mkdir(dir, { recursive: true });
  const db = dir === 'memory' ? new PGlite() : new PGlite(dir);
  await db.exec(SCHEMA);
  const query: Query = async <T,>(sql: string, params?: unknown[]) => (await db.query<T>(sql, params as unknown[])).rows;
  return {
    query,
    tx: (fn) => db.transaction((t) => fn(async <T,>(sql: string, params?: unknown[]) => (await t.query<T>(sql, params as unknown[])).rows)),
  };
}

const g = globalThis as unknown as { __vicelicDb?: Promise<Driver> };

export function db(): Promise<Driver> {
  g.__vicelicDb ??= createDriver().catch((e) => {
    g.__vicelicDb = undefined; // retry on the next request
    throw e;
  });
  return g.__vicelicDb;
}
