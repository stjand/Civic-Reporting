import knex from './knex.js';

async function runMigrationsAndSeeds() {
  try {
    console.log('Running migrations...');
    await knex.migrate.latest();
    console.log('Migrations completed!');

    console.log('Running seeds...');
    await knex.seed.run();
    console.log('Seeds completed!');
  } catch (err) {
    console.error('Migration/Seed error:', err);
    process.exit(1);
  } finally {
    await knex.destroy();
  }
}

runMigrationsAndSeeds();
