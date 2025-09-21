// Safe migration: add missing columns to `reports` table if they are not present.
// Run this with: npx knex migrate:latest

export async function up(knex) {
  const hasReports = await knex.schema.hasTable('reports');
  if (!hasReports) {
    // If reports table doesn’t exist, create it with all necessary columns
    await knex.schema.createTable('reports', function (table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').nullable();
      table.integer('department_id').unsigned().references('id').inTable('departments').nullable();
      table.string('title', 200).notNullable();
      table.text('description');
      table.string('category', 50).notNullable().defaultTo('other');
      table.string('status', 20).defaultTo('new');
      table.string('priority', 10).defaultTo('medium');
      table.text('address');
      table.decimal('latitude', 10, 8);
      table.decimal('longitude', 11, 8);
      table.json('image_urls');
      table.string('audio_url', 255);
      table.string('user_name', 100).defaultTo('Anonymous');
      table.integer('urgency_score').defaultTo(5);
      table.integer('assigned_to').unsigned().references('id').inTable('users');
      table.text('resolution_comment');
      table.date('estimated_resolution_date');
      table.date('actual_resolution_date');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    return;
  }

  // If reports table exists, add missing columns one by one
  if (!(await knex.schema.hasColumn('reports', 'category'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.string('category', 50).notNullable().defaultTo('other');
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'priority'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.string('priority', 10).defaultTo('medium');
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'latitude'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.decimal('latitude', 10, 8);
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'longitude'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.decimal('longitude', 11, 8);
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'image_urls'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.json('image_urls');
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'audio_url'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.string('audio_url', 255);
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'user_name'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.string('user_name', 100).defaultTo('Anonymous');
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'urgency_score'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.integer('urgency_score').defaultTo(5);
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'department_id'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.integer('department_id').unsigned().references('id').inTable('departments').nullable();
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'address'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.text('address');
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'user_id'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.integer('user_id').unsigned().references('id').inTable('users').nullable();
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'assigned_to'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.integer('assigned_to').unsigned().references('id').inTable('users');
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'created_at'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
  if (!(await knex.schema.hasColumn('reports', 'updated_at'))) {
    await knex.schema.alterTable('reports', (table) => {
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex) {
  // Remove columns added by this migration if they exist
  const cols = [
    'category',
    'priority',
    'latitude',
    'longitude',
    'image_urls',
    'audio_url',
    'user_name',
    'urgency_score',
    'department_id',
    'address',
    'user_id',
    'assigned_to',
    'created_at',
    'updated_at'
  ];
  for (const col of cols) {
    if (await knex.schema.hasColumn('reports', col)) {
      await knex.schema.alterTable('reports', (table) => {
        table.dropColumn(col);
      });
    }
  }
}
