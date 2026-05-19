const db = require('./db');
const { IProductRepository } = require('../interfaces');
const { paginationMeta } = require('../../utils/paginate');

class MySQLProductRepository extends IProductRepository {
  async findAll({ page = 1, limit = 20, categoryId, minPrice, maxPrice, sort = 'newest', search, isFeatured, inStock } = {}) {
    page = Number(page);
    limit = Number(limit);

    const buildQuery = () => {
      let q = db('products');
      if (categoryId) q = q.where('category_id', categoryId);
      if (minPrice != null) q = q.where('price', '>=', Number(minPrice));
      if (maxPrice != null) q = q.where('price', '<=', Number(maxPrice));
      if (isFeatured) q = q.where('is_featured', true);
      if (inStock) q = q.where('stock', '>', 0);
      if (search) q = q.where((b) => b.where('name', 'like', `%${search}%`).orWhere('description', 'like', `%${search}%`));
      return q;
    };

    const sortMap = {
      newest: ['created_at', 'desc'],
      price_asc: ['price', 'asc'],
      price_desc: ['price', 'desc'],
      rating: ['rating', 'desc'],
      popular: ['sold_count', 'desc'],
    };
    const [col, dir] = sortMap[sort] || sortMap.newest;

    const [{ total }] = await buildQuery().count('id as total');
    const items = await buildQuery()
      .orderBy(col, dir)
      .limit(limit)
      .offset((page - 1) * limit);

    return { items: items.map(toProduct), ...paginationMeta(total, page, limit) };
  }

  async findById(id) {
    const row = await db('products').where('id', id).first();
    return row ? toProduct(row) : null;
  }

  async decrementStock(id, quantity) {
    const updated = await db('products').where('id', id).where('stock', '>=', quantity).decrement('stock', quantity);
    if (!updated) throw new Error('재고가 부족합니다.');
    return this.findById(id);
  }

  async incrementStock(id, quantity) {
    await db('products').where('id', id).increment('stock', quantity);
    return this.findById(id);
  }
}

function toProduct(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    category: row.category_name || null,
    name: row.name,
    description: row.description,
    price: row.price,
    originalPrice: row.original_price,
    stock: row.stock,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    soldCount: row.sold_count,
    isFeatured: !!row.is_featured,
    isNew: !!row.is_new,
    tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || '[]'),
    images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
    createdAt: row.created_at,
  };
}

module.exports = MySQLProductRepository;
