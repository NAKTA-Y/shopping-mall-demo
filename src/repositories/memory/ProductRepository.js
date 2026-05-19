const { IProductRepository } = require('../interfaces');
const { paginate, paginationMeta } = require('../../utils/paginate');

class MemoryProductRepository extends IProductRepository {
  constructor() {
    super();
    /** @type {Map<string, object>} */
    this._store = new Map();
  }

  async findAll({ page = 1, limit = 20, categoryId, minPrice, maxPrice, sort = 'newest', search, isFeatured, inStock } = {}) {
    let items = Array.from(this._store.values());

    if (categoryId) items = items.filter((p) => p.categoryId === categoryId);
    if (minPrice != null) items = items.filter((p) => p.price >= minPrice);
    if (maxPrice != null) items = items.filter((p) => p.price <= maxPrice);
    if (isFeatured === true) items = items.filter((p) => p.isFeatured);
    if (inStock === true) items = items.filter((p) => p.stock > 0);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    const sortFns = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      price_asc: (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      popular: (a, b) => b.soldCount - a.soldCount,
    };
    items.sort(sortFns[sort] || sortFns.newest);

    const total = items.length;
    return { items: paginate(items, page, limit), ...paginationMeta(total, page, limit) };
  }

  async findById(id) {
    return this._store.get(id) || null;
  }

  async decrementStock(id, quantity) {
    const p = this._store.get(id);
    if (!p) throw new Error('Product not found');
    if (p.stock < quantity) throw new Error('재고가 부족합니다.');
    p.stock -= quantity;
    return p;
  }

  async incrementStock(id, quantity) {
    const p = this._store.get(id);
    if (!p) throw new Error('Product not found');
    p.stock += quantity;
    return p;
  }
}

module.exports = MemoryProductRepository;
