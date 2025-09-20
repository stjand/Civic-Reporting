// knexfile.js
import 'dotenv/config'; // Load environment variables from .env
import path from 'path';

const baseDir = process.cwd();

export default {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL, // Supabase connection string
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(baseDir, 'migrations'), // Your migrations folder
    },
    seeds: {
      directory: path.join(baseDir, 'seeds'), // Your seeds folder
    },
  },

  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(baseDir, 'migrations'),
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      directory: path.join(baseDir, 'migrations'),
    },
    seeds: {
      directory: path.join(baseDir, 'seeds'),
    },
  },
};
