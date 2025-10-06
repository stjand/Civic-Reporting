import knexLib from 'knex';
import knexConfig from './knexfile.js';

const environment = process.env.NODE_ENV || 'development';

let config = knexConfig[environment];

// For production with Supabase connection pooler
if (environment === 'production' && process.env.DATABASE_URL) {
  config = {
    ...config,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: { 
      min: 0, 
      max: 10,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      createTimeoutMillis: 30000
    },
  };
}

const knex = knexLib(config);

export default knex;