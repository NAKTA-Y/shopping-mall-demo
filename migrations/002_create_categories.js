/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('categories', (t) => {
    t.string('id', 36).primary();
    t.string('name', 50).notNullable();
    t.string('slug', 50).notNullable().unique();
    t.string('description', 200);
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('categories');
};
