export const up = function(knex) {
  return knex.schema.alterTable('reports', function(table) {
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
  });
};

export const down = function(knex) {
  return knex.schema.alterTable('reports', function(table) {
    table.dropColumn('latitude');
    table.dropColumn('longitude');
  });
};