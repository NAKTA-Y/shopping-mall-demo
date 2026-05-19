const db = require('./db');
const { IOrderRepository } = require('../interfaces');
const { randomUUID } = require('crypto');
const { paginationMeta } = require('../../utils/paginate');

class MySQLOrderRepository extends IOrderRepository {
  async create({ userId, items, totalAmount, shippingFee, paymentMethod, shippingAddress }) {
    const orderId = randomUUID();
    await db.transaction(async (trx) => {
      await trx('orders').insert({
        id: orderId,
        user_id: userId,
        total_amount: totalAmount,
        shipping_fee: shippingFee,
        status: 'paid',
        payment_method: paymentMethod,
        recipient: shippingAddress.recipient || '',
        recipient_phone: shippingAddress.phone || '',
        zip_code: shippingAddress.zipCode || '',
        address_line1: shippingAddress.line1,
        address_line2: shippingAddress.line2 || null,
      });
      await trx('order_items').insert(
        items.map((item) => ({
          id: randomUUID(),
          order_id: orderId,
          product_id: item.productId,
          product_name: item.name,
          unit_price: item.price,
          quantity: item.quantity,
          image: item.image || null,
        })),
      );
    });
    return this.findById(orderId);
  }

  async findById(id) {
    const order = await db('orders').where('id', id).first();
    if (!order) return null;
    const items = await db('order_items').where('order_id', id);
    return toOrder(order, items);
  }

  async findByUserId(userId, { page = 1, limit = 10 } = {}) {
    page = Number(page);
    limit = Number(limit);
    const [{ total }] = await db('orders').where('user_id', userId).count('id as total');
    const orders = await db('orders')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    const orderIds = orders.map((o) => o.id);
    const allItems = orderIds.length ? await db('order_items').whereIn('order_id', orderIds) : [];
    const itemsMap = allItems.reduce((m, i) => { (m[i.order_id] = m[i.order_id] || []).push(i); return m; }, {});

    return {
      items: orders.map((o) => toOrder(o, itemsMap[o.id] || [])),
      ...paginationMeta(total, page, limit),
    };
  }

  async updateStatus(id, status) {
    await db('orders').where('id', id).update({ status });
    return this.findById(id);
  }
}

function toOrder(row, items = []) {
  return {
    id: row.id,
    userId: row.user_id,
    items: items.map((i) => ({
      productId: i.product_id,
      name: i.product_name,
      price: i.unit_price,
      quantity: i.quantity,
      image: i.image,
    })),
    totalAmount: row.total_amount,
    shippingFee: row.shipping_fee,
    status: row.status,
    paymentMethod: row.payment_method,
    shippingAddress: {
      recipient: row.recipient,
      phone: row.recipient_phone,
      zipCode: row.zip_code,
      line1: row.address_line1,
      line2: row.address_line2,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = MySQLOrderRepository;
