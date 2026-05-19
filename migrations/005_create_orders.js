/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable('orders', (t) => {
    t.string('id', 36).primary();
    t.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('RESTRICT');
    t.integer('total_amount').unsigned().notNullable();
    t.integer('shipping_fee').unsigned().notNullable().defaultTo(0);
    t.enu('status', ['pending', 'paid', 'shipping', 'delivered', 'cancelled']).notNullable().defaultTo('pending');
    t.string('payment_method', 50);
    t.string('recipient', 50).notNullable();
    t.string('recipient_phone', 20).notNullable();
    t.string('zip_code', 10).notNullable();
    t.string('address_line1', 200).notNullable();
    t.string('address_line2', 100);
    t.timestamps(true, true);

    t.index('user_id');
    t.index('status');
    t.index('created_at');
  });

  await knex.schema.createTable('order_items', (t) => {
    t.string('id', 36).primary();
    t.string('order_id', 36).notNullable().references('id').inTable('orders').onDelete('CASCADE');
    t.string('product_id', 36).notNullable().references('id').inTable('products').onDelete('RESTRICT');
    t.string('product_name', 200).notNullable();   // 주문 시점 스냅샷
    t.integer('unit_price').unsigned().notNullable(); // 주문 시점 스냅샷
    t.integer('quantity').unsigned().notNullable();
    t.string('image', 300);

    t.index('order_id');
    t.index('product_id');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('order_items');
  await knex.schema.dropTable('orders');
};
