/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('tokens', (t) => {
    t.string('token', 64).primary();
    t.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.datetime('expires_at').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());

    t.index('user_id');
    t.index('expires_at');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('tokens');
};
