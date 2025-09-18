// File: backend/knexfile.js
export default {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      database: 'civic_reporter',
      user: 'dev',
      password: 'dev123'
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  
  test: {
    client: 'postgresql',
    connection: process.env.TEST_DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      database: 'civic_reporter_test',
      user: 'dev',
      password: 'dev123'
    },
    migrations: {
      directory: './migrations'
    }
  },
  
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
}
