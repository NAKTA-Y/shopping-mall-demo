const { IOrderRepository } = require('../interfaces');
const { randomUUID } = require('crypto');
const { paginate, paginationMeta } = require('../../utils/paginate');

class MemoryOrderRepository extends IOrderRepository {
  constructor() {
    super();
    /** @type {Map<string, object>} */
    this._store = new Map();
  }

  async create({ userId, items, totalAmount, shippingFee, paymentMethod, shippingAddress }) {
    const order = {
      id: randomUUID(),
      userId,
      items: items.map((item) => ({ ...item })),
      totalAmount,
      shippingFee,
      status: 'paid',
      paymentMethod,
      shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this._store.set(order.id, order);
    return order;
  }

  async findById(id) {
    return this._store.get(id) || null;
  }

  async findByUserId(userId, { page = 1, limit = 10 } = {}) {
    const all = Array.from(this._store.values())
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = all.length;
    return { items: paginate(all, page, limit), ...paginationMeta(total, page, limit) };
  }

  async updateStatus(id, status) {
    const order = this._store.get(id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }
}

module.exports = MemoryOrderRepository;
