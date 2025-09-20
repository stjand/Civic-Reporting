import knexLib from 'knex';
import config from './knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const knex = knexLib(config[environment]);

console.log('Attempting to run database migrations...');

knex.migrate.latest()
  .then(() => {
    console.log('Migrations completed successfully!');
    knex.destroy();
  })
  .catch((err) => {
    console.error('Error during migrations:', err);
    knex.destroy();
    process.exit(1);
  });