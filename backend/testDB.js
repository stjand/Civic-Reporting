import knexLib from 'knex';
import config from './knexfile.js';

const knex = knexLib(config.development);

async function test() {
  try {
    const res = await knex('reports').select('*');
    console.log('✅ DB connected:', res);
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  } finally {
    await knex.destroy();
  }
}

test();
