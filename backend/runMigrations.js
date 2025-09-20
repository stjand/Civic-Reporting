import knexLib from 'knex';
import config from './knexfile.js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const environment = process.env.NODE_ENV || 'development';
const knex = knexLib(config[environment]);

async function runMigrations() {
  try {
    const migrationDir = path.join(process.cwd(), 'migrations');
    const migrations = fs.readdirSync(migrationDir).filter(file => file.endsWith('.js'));

    if (migrations.length === 0) {
      console.log('No migration files found in migrations folder.');
      return;
    }

    for (const file of migrations) {
      const fileUrl = pathToFileURL(path.join(migrationDir, file)).href;
      const migration = await import(fileUrl);
      console.log(`Running migration: ${file}`);
      await migration.up(knex);
    }

    console.log('✅ All migrations executed successfully.');
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    await knex.destroy();
  }
}

runMigrations();
