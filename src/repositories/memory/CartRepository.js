const { ICartRepository } = require('../interfaces');
const { randomUUID } = require('crypto');

class MemoryCartRepository extends ICartRepository {
  constructor() {
    super();
    /** @type {Map<string, object[]>} userId -> CartItem[] */
    this._store = new Map();
  }

  _getCart(userId) {
    if (!this._store.has(userId)) this._store.set(userId, []);
    return this._store.get(userId);
  }

  async findByUserId(userId) {
    const items = this._getCart(userId);
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { items, totalAmount };
  }

  async upsertItem(userId, { productId, name, price, image, quantity = 1 }) {
    const items = this._getCart(userId);
    const existing = items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ id: randomUUID(), productId, name, price, image, quantity });
    }
    return this.findByUserId(userId);
  }

  async updateItemQuantity(userId, cartItemId, quantity) {
    const items = this._getCart(userId);
    const item = items.find((i) => i.id === cartItemId);
    if (!item) return null;
    item.quantity = quantity;
    return this.findByUserId(userId);
  }

  async removeItem(userId, cartItemId) {
    const items = this._getCart(userId);
    const idx = items.findIndex((i) => i.id === cartItemId);
    if (idx === -1) return null;
    items.splice(idx, 1);
    return this.findByUserId(userId);
  }

  async clear(userId) {
    this._store.set(userId, []);
  }
}

module.exports = MemoryCartRepository;
