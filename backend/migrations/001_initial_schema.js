// backend/migrations/001_initial_schema.js
export const up = async function(knex) {
  await knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('phone', 15).unique().notNullable();
    table.string('name', 100);
    table.string('role', 20).defaultTo('citizen');
    table.boolean('is_verified').defaultTo(false);
    table.integer('reputation_score').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('departments', function(table) {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.text('description');
    table.string('contact_phone', 15);
    table.string('contact_email', 100);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('reports', function(table) {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users');
    table.integer('department_id').references('id').inTable('departments');
    table.string('title', 200).notNullable();
    table.text('description');
    table.string('category', 50).notNullable();
    table.string('status', 20).defaultTo('new');
    table.string('priority', 10).defaultTo('medium');
    table.text('address');
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
    table.json('image_urls');
    table.string('audio_url', 255);
    table.string('user_name', 100).defaultTo('Anonymous');
    table.integer('urgency_score').defaultTo(5);
    table.integer('assigned_to').references('id').inTable('users');
    table.text('resolution_comment');
    table.date('estimated_resolution_date');
    table.date('actual_resolution_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('report_status_history', function(table) {
    table.increments('id').primary();
    table.integer('report_id').references('id').inTable('reports').onDelete('CASCADE');
    table.string('old_status', 20);
    table.string('new_status', 20);
    table.text('comment');
    table.integer('changed_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('notifications', function(table) {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users');
    table.integer('report_id').references('id').inTable('reports');
    table.string('title', 200).notNullable();
    table.text('message').notNullable();
    table.string('type', 20).defaultTo('info');
    table.boolean('is_read').defaultTo(false);
    table.string('fcm_token', 255);
    table.timestamp('sent_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('analytics_hotspots', function(table) {
    table.increments('id').primary();
    table.decimal('grid_lat', 10, 8);
    table.decimal('grid_lng', 11, 8);
    table.integer('report_count').defaultTo(0);
    table.string('dominant_category', 50);
    table.float('avg_resolution_hours');
    table.date('date_calculated').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

export const down = async function(knex) {
  await knex.schema.dropTableIfExists('analytics_hotspots');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('report_status_history');
  await knex.schema.dropTableIfExists('reports');
  await knex.schema.dropTableIfExists('departments');
  await knex.schema.dropTableIfExists('users');
};