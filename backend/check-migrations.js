import knex from './src/knex.js';

async function checkMigration() {
  try {
    console.log('Checking database connection...');
    await knex.raw('SELECT 1');
    console.log('✅ Database connected successfully');

    console.log('Checking if reports table exists...');
    const exists = await knex.schema.hasTable('reports');
    console.log(`Reports table exists: ${exists}`);

    if (exists) {
      const count = await knex('reports').count('* as count');
      console.log(`Reports in database: ${count[0].count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    process.exit(1);
  }
}

checkMigration();
