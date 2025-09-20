export const up = function(knex) {
  return knex.schema.hasTable('reports').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('reports', table => {
        table.increments('id').primary();
        table.string('report_id').unique().notNullable();
        table.string('title').notNullable();
        table.text('description');
        table.string('category').notNullable();
        table.string('status').defaultTo('new');
        table.json('location');
        table.string('address');
        table.string('user_name').defaultTo('Anonymous');
        table.json('photos');
        table.string('priority').defaultTo('medium');
        table.integer('urgency_score').defaultTo(5);
        table.timestamps(true, true);
      });
    }
  });
};

export const down = function(knex) {
  return knex.schema.dropTableIfExists('reports');
};
