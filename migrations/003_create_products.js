/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('products', (t) => {
    t.string('id', 36).primary();
    t.string('category_id', 36).notNullable().references('id').inTable('categories').onDelete('RESTRICT');
    t.string('name', 200).notNullable();
    t.text('description');
    t.integer('price').unsigned().notNullable();
    t.integer('original_price').unsigned().notNullable();
    t.integer('stock').unsigned().notNullable().defaultTo(0);
    t.decimal('rating', 3, 2).unsigned().defaultTo(0);
    t.integer('review_count').unsigned().defaultTo(0);
    t.integer('sold_count').unsigned().defaultTo(0);
    t.boolean('is_featured').defaultTo(false);
    t.boolean('is_new').defaultTo(false);
    t.json('tags');
    t.json('images');
    t.timestamps(true, true);

    t.index('category_id');
    t.index('price');
    t.index('rating');
    t.index('sold_count');
    t.index('is_featured');
    t.index('created_at');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('products');
};
