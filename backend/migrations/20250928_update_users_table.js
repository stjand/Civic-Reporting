export async function up(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.enu("role", ["citizen", "official"]).notNullable().defaultTo("citizen");
    table.string("department");
    table.string("designation");
    table.string("location");
  });
}

export async function down(knex) {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("role");
    table.dropColumn("department");
    table.dropColumn("designation");
    table.dropColumn("location");
  });
}
