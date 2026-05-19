const { faker } = require('@faker-js/faker/locale/ko');
const { randomUUID } = require('crypto');

const ORDER_TOTAL = 50000;
const ORDER_CHUNK = 1000;
const ITEM_CHUNK = 2000;
const STATUSES = ['pending', 'paid', 'shipping', 'delivered', 'delivered', 'delivered', 'cancelled'];
const PAYMENTS = ['신용카드', '카카오페이', '네이버페이', '토스페이', '무통장입금'];

/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  await knex('order_items').del();
  await knex('orders').del();

  const userIds = (await knex('users').select('id')).map((u) => u.id);
  const products = await knex('products').select('id', 'name', 'price', 'images');

  if (userIds.length === 0 || products.length === 0) {
    console.error('[seed] users 또는 products가 없습니다. 이전 시드를 먼저 실행하세요.');
    return;
  }

  const orders = [];
  const orderItems = [];

  for (let i = 0; i < ORDER_TOTAL; i++) {
    const orderId = randomUUID();
    const userId = faker.helpers.arrayElement(userIds);
    const itemCount = faker.number.int({ min: 1, max: 5 });
    const selectedProducts = faker.helpers.arrayElements(products, itemCount);
    const shippingFee = faker.helpers.arrayElement([0, 0, 0, 3000]);
    const createdAt = faker.date.between({ from: '2022-01-01', to: new Date() });

    let totalAmount = shippingFee;
    for (const p of selectedProducts) {
      const qty = faker.number.int({ min: 1, max: 3 });
      const images = JSON.parse(p.images || '[]');
      totalAmount += p.price * qty;
      orderItems.push({
        id: randomUUID(),
        order_id: orderId,
        product_id: p.id,
        product_name: p.name,
        unit_price: p.price,
        quantity: qty,
        image: images[0] || null,
      });
    }

    orders.push({
      id: orderId,
      user_id: userId,
      total_amount: totalAmount,
      shipping_fee: shippingFee,
      status: faker.helpers.arrayElement(STATUSES),
      payment_method: faker.helpers.arrayElement(PAYMENTS),
      recipient: faker.person.fullName(),
      recipient_phone: faker.phone.number('010-####-####'),
      zip_code: faker.location.zipCode('#####'),
      address_line1: `${faker.location.city()} ${faker.location.streetAddress()}`,
      address_line2: `${faker.number.int({ min: 1, max: 30 })}동 ${faker.number.int({ min: 101, max: 2503 })}호`,
      created_at: createdAt,
      updated_at: createdAt,
    });

    // 배치 플러시
    if (orders.length === ORDER_CHUNK) {
      await knex('orders').insert(orders.splice(0, ORDER_CHUNK));
      const batch = orderItems.splice(0, orderItems.length);
      for (let j = 0; j < batch.length; j += ITEM_CHUNK) {
        await knex('order_items').insert(batch.slice(j, j + ITEM_CHUNK));
      }
      process.stdout.write(`\r[seed] orders: ${i + 1}/${ORDER_TOTAL}건 처리 중...`);
    }
  }

  // 나머지 플러시
  if (orders.length > 0) {
    await knex('orders').insert(orders);
    for (let j = 0; j < orderItems.length; j += ITEM_CHUNK) {
      await knex('order_items').insert(orderItems.slice(j, j + ITEM_CHUNK));
    }
  }

  console.log(`\n[seed] orders: ${ORDER_TOTAL}건 삽입 완료`);
};
