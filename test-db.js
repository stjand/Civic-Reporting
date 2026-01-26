// test-db.js
import db from './backend/knex.js';

db.raw('SELECT 1+1 AS result')
  .then(res => {
    console.log('✅ DB Connection Successful:', res.rows);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ DB Connection Error:', err);
    process.exit(1);
  });
