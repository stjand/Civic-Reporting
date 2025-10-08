import knexLib from 'knex';
import knexConfig from './knexfile.js';

const environment = process.env.NODE_ENV || 'development';
let config = knexConfig[environment];

// ✅ Production fix for Supabase
if (environment === 'production' && process.env.DATABASE_URL) {
  config = {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // important for Supabase
    },
    pool: { 
      min: 2, 
      max: 10,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 600000,
      createTimeoutMillis: 30000,
      propagateCreateError: false
    },
    acquireConnectionTimeout: 60000,
  };
}

const knex = knexLib(config);

export default knex;
