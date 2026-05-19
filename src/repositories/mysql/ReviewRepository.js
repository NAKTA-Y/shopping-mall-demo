const db = require('./db');
const { IReviewRepository } = require('../interfaces');
const { randomUUID } = require('crypto');
const { paginationMeta } = require('../../utils/paginate');

class MySQLReviewRepository extends IReviewRepository {
  async findByProductId(productId, { page = 1, limit = 10, sort = 'newest' } = {}) {
    page = Number(page);
    limit = Number(limit);

    const sortMap = {
      newest: ['created_at', 'desc'],
      helpful: ['helpful', 'desc'],
      rating_desc: ['rating', 'desc'],
      rating_asc: ['rating', 'asc'],
    };
    const [col, dir] = sortMap[sort] || sortMap.newest;

    const [{ total }] = await db('reviews').where('product_id', productId).count('id as total');
    const items = await db('reviews')
      .where('product_id', productId)
      .orderBy(col, dir)
      .limit(limit)
      .offset((page - 1) * limit);

    return { items: items.map(toReview), ...paginationMeta(total, page, limit) };
  }

  async create({ productId, userId, userName, rating, title, content }) {
    const id = randomUUID();
    await db('reviews').insert({
      id,
      product_id: productId,
      user_id: userId,
      user_name: userName,
      rating,
      title,
      content,
    });
    const row = await db('reviews').where('id', id).first();
    return toReview(row);
  }

  async existsByUserAndProduct(userId, productId) {
    const row = await db('reviews').where({ user_id: userId, product_id: productId }).first();
    return !!row;
  }
}

function toReview(row) {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    userName: row.user_name,
    rating: row.rating,
    title: row.title,
    content: row.content,
    helpful: row.helpful,
    createdAt: row.created_at,
  };
}

module.exports = MySQLReviewRepository;
