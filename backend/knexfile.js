import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10, idleTimeoutMillis: 30000 },
    migrations: { directory: path.join(__dirname, 'migrations') },
    seeds: { directory: path.join(__dirname, 'seeds') },
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: { directory: path.join(__dirname, 'migrations') },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 1,
      max: 5,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      propagateCreateError: false
    },
    migrations: { directory: path.join(__dirname, 'migrations') },
    seeds: { directory: path.join(__dirname, 'seeds') },
  }
};