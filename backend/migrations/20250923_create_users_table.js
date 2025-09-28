import { createRequire } from 'module'; // <-- NEW: Import createRequire
const require = createRequire(import.meta.url); // <-- NEW: Set up require for this file

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.enu('role', ['user', 'admin']).notNullable().defaultTo('user');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
  .then(() => {
    // Add a default 'admin' user for initial setup
    // This require now works because it was defined above
    const bcrypt = require('bcrypt');
    const hashedPassword = bcrypt.hashSync('adminpassword', 10);
    
    return knex('users').insert({
      name: 'Site Administrator',
      email: 'admin@civic.report',
      password: hashedPassword,
      role: 'admin'
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};