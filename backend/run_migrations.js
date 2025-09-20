import knexLib from 'knex';
import knexConfig from './knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const knex = knexLib(knexConfig[environment]);

console.log('Attempting to run database migrations...');

knex.migrate.latest()
  .then(() => {
    console.log('Migrations completed successfully!');
    return knex.seed.run();
  })
  .then(() => {
    console.log('Seed data inserted successfully!');
    knex.destroy();
  })
  .catch((err) => {
    console.error('Error during migrations/seeding:', err);
    knex.destroy();
    process.exit(1);
  });