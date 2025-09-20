import path from 'path';

const baseDir = process.cwd(); // Use current working directory

export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(baseDir, 'database.sqlite')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(baseDir, 'migrations')
    },
    seeds: {
      directory: path.join(baseDir, 'seeds')
    }
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: path.join(baseDir, 'test_database.sqlite')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(baseDir, 'migrations')
    }
  },

  production: {
    client: 'sqlite3',
    connection: process.env.DATABASE_URL || {
      filename: path.join(baseDir, 'database.sqlite')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(baseDir, 'migrations')
    },
    seeds: {
      directory: path.join(baseDir, 'seeds')
    }
  }
};