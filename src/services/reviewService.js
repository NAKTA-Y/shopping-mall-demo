const { reviewRepo, productRepo } = require('../repositories');
const ApiError = require('../utils/ApiError');

async function listReviews(productId, { page = 1, limit = 10, sort = 'newest' } = {}) {
  const product = await productRepo.findById(productId);
  if (!product) throw new ApiError(404, '상품을 찾을 수 없습니다.');

  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(50, Math.max(1, parseInt(limit) || 10));

  return reviewRepo.findByProductId(productId, { page, limit, sort });
}

async function createReview(userId, userName, { productId, rating, title, content }) {
  if (!productId || !rating || !content) throw new ApiError(400, 'productId, rating, content는 필수입니다.');
  rating = parseInt(rating);
  if (rating < 1 || rating > 5) throw new ApiError(400, '평점은 1~5 사이여야 합니다.');

  const product = await productRepo.findById(productId);
  if (!product) throw new ApiError(404, '상품을 찾을 수 없습니다.');

  const exists = await reviewRepo.existsByUserAndProduct(userId, productId);
  if (exists) throw new ApiError(409, '이미 리뷰를 작성한 상품입니다.');

  return reviewRepo.create({ productId, userId, userName, rating, title, content });
}

module.exports = { listReviews, createReview };
