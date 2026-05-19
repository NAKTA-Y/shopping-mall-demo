/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', (t) => {
    t.string('id', 36).primary();
    t.string('name', 50).notNullable();
    t.string('email', 100).notNullable().unique();
    t.string('password_hash', 64).notNullable();
    t.string('phone', 20);
    t.string('zip_code', 10);
    t.string('address_line1', 200);
    t.string('address_line2', 100);
    t.enu('role', ['customer', 'admin']).notNullable().defaultTo('customer');
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
