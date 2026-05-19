/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('cart_items', (t) => {
    t.string('id', 36).primary();
    t.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('product_id', 36).notNullable().references('id').inTable('products').onDelete('CASCADE');
    t.integer('quantity').unsigned().notNullable().defaultTo(1);
    t.timestamps(true, true);

    t.unique(['user_id', 'product_id']);
    t.index('user_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('cart_items');
};
