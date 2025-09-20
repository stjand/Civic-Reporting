import path from 'path';

const baseDir = path.resolve('./backend'); // ensures paths work both locally and on Render

export default {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host: 'postgres',
      port: 5432,
      database: 'civic_reporter',
      user: 'dev',
      password: 'dev123'
    },
    migrations: {
      directory: path.join(baseDir, 'migrations')
    },
    seeds: {
      directory: path.join(baseDir, 'seeds')
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
      directory: path.join(baseDir, 'migrations')
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.join(baseDir, 'migrations')
    },
    seeds: {
      directory: path.join(baseDir, 'seeds')
    }
  }
};