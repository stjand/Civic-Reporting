// File: knexfile.js (FINAL CORRECTED VERSION)

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  development: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      keepAlive: true,
      statement_timeout: 15000,
      // SSL not required for local development
    },
    pool: { min: 2, max: 10, idleTimeoutMillis: 30000 },
    migrations: { directory: path.join(__dirname, 'migrations') },
    seeds: { directory: path.join(__dirname, 'seeds') },
  },
  test: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      keepAlive: true,
      statement_timeout: 15000,
    },
    pool: { min: 2, max: 10 },
    migrations: { directory: path.join(__dirname, 'migrations') },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      keepAlive: true,
      statement_timeout: 15000,
      ssl: { rejectUnauthorized: false }, // ✅ Required for Supabase remote connection
    },
    pool: { min: 2, max: 20, idleTimeoutMillis: 30000 },
    migrations: { directory: path.join(__dirname, 'migrations') },
    seeds: { directory: path.join(__dirname, 'seeds') },
  },
};
