/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('reviews', (t) => {
    t.string('id', 36).primary();
    t.string('product_id', 36).notNullable().references('id').inTable('products').onDelete('CASCADE');
    t.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('user_name', 50).notNullable();
    t.tinyint('rating').unsigned().notNullable();
    t.string('title', 100);
    t.text('content').notNullable();
    t.integer('helpful').unsigned().defaultTo(0);
    t.timestamps(true, true);

    t.unique(['product_id', 'user_id']);
    t.index('product_id');
    t.index('user_id');
    t.index('rating');
    t.index('created_at');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('reviews');
};
