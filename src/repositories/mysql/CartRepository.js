const db = require('./db');
const { ICartRepository } = require('../interfaces');
const { randomUUID } = require('crypto');

class MySQLCartRepository extends ICartRepository {
  async findByUserId(userId) {
    const items = await db('cart_items as ci')
      .join('products as p', 'ci.product_id', 'p.id')
      .where('ci.user_id', userId)
      .select(
        'ci.id',
        'ci.product_id as productId',
        'p.name',
        'p.price',
        db.raw('JSON_UNQUOTE(JSON_EXTRACT(p.images, "$[0]")) as image'),
        'ci.quantity',
      );

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { items, totalAmount };
  }

  async upsertItem(userId, { productId, name, price, image, quantity = 1 }) {
    const existing = await db('cart_items').where({ user_id: userId, product_id: productId }).first();
    if (existing) {
      await db('cart_items').where('id', existing.id).increment('quantity', quantity);
    } else {
      await db('cart_items').insert({
        id: randomUUID(),
        user_id: userId,
        product_id: productId,
        quantity,
      });
    }
    return this.findByUserId(userId);
  }

  async updateItemQuantity(userId, cartItemId, quantity) {
    const updated = await db('cart_items').where({ id: cartItemId, user_id: userId }).update({ quantity });
    if (!updated) return null;
    return this.findByUserId(userId);
  }

  async removeItem(userId, cartItemId) {
    const deleted = await db('cart_items').where({ id: cartItemId, user_id: userId }).del();
    if (!deleted) return null;
    return this.findByUserId(userId);
  }

  async clear(userId) {
    await db('cart_items').where('user_id', userId).del();
  }
}

module.exports = MySQLCartRepository;
