import knexLib from 'knex';
import knexConfig from '../knexfile.js'; // go up one level from src/

const environment = process.env.NODE_ENV || 'development';

let config = knexConfig[environment];

// For production (Render + Supabase), override connection with DATABASE_URL
if (environment === 'production' && process.env.DATABASE_URL) {
  config = {
    ...config,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Supabase
      },
    },
    pool: { min: 0, max: 10 }, // optional, tune pool as needed
  };
}

const knex = knexLib(config);

export default knex;
