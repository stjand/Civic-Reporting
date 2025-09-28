// 20250928_fix_users_table_structure.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export const up = function(knex) {
  return knex.schema.dropTableIfExists('users')
    .then(() => {
      return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.enu('role', ['citizen', 'official', 'admin']).notNullable().defaultTo('citizen');
        table.string('department').nullable();
        table.string('designation').nullable();
        table.string('location').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      });
    })
    .then(() => {
      const bcrypt = require('bcrypt');
      const users = [
        {
          name: 'Demo Citizen',
          email: 'citizen@demo.com',
          password: bcrypt.hashSync('password123', 10),
          role: 'citizen'
        },
        {
          name: 'Demo Official',
          email: 'official@demo.com',
          password: bcrypt.hashSync('password123', 10),
          role: 'official',
          department: 'Roads & Infrastructure',
          designation: 'Assistant Engineer',
          location: 'Zone 1'
        },
        {
          name: 'Site Administrator',
          email: 'admin@civic.report',
          password: bcrypt.hashSync('adminpassword', 10),
          role: 'admin'
        }
      ];
      return knex('users').insert(users);
    });
};

export const down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};