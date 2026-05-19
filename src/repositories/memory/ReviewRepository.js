const { IReviewRepository } = require('../interfaces');
const { randomUUID } = require('crypto');
const { paginate, paginationMeta } = require('../../utils/paginate');

class MemoryReviewRepository extends IReviewRepository {
  constructor() {
    super();
    /** @type {Map<string, object>} */
    this._store = new Map();
  }

  async findByProductId(productId, { page = 1, limit = 10, sort = 'newest' } = {}) {
    let items = Array.from(this._store.values()).filter((r) => r.productId === productId);

    const sortFns = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      helpful: (a, b) => b.helpful - a.helpful,
      rating_desc: (a, b) => b.rating - a.rating,
      rating_asc: (a, b) => a.rating - b.rating,
    };
    items.sort(sortFns[sort] || sortFns.newest);

    const total = items.length;
    return { items: paginate(items, page, limit), ...paginationMeta(total, page, limit) };
  }

  async create({ productId, userId, userName, rating, title, content }) {
    const review = {
      id: randomUUID(),
      productId, userId, userName, rating, title, content,
      helpful: 0,
      createdAt: new Date().toISOString(),
    };
    this._store.set(review.id, review);
    return review;
  }

  async existsByUserAndProduct(userId, productId) {
    for (const r of this._store.values()) {
      if (r.userId === userId && r.productId === productId) return true;
    }
    return false;
  }
}

module.exports = MemoryReviewRepository;
