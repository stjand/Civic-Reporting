import knexLib from 'knex';
import knexConfig from './knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const knex = knexLib(knexConfig[environment]);

async function runMigrationsAndSeeds() {
  try {
    console.log('Attempting to run database migrations...');
    await knex.migrate.latest(); // wait until all migrations finish
    console.log('Migrations completed successfully!');

    console.log('Running seed data...');
    await knex.seed.run(); // wait until seeds finish
    console.log('Seed data inserted successfully!');

  } catch (err) {
    console.error('Error during migrations/seeding:', err);
    process.exit(1);
  } finally {
    await knex.destroy();
  }
}

runMigrationsAndSeeds();
