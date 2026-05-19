const { productRepo } = require('../repositories');
const ApiError = require('../utils/ApiError');

const VALID_SORTS = ['newest', 'price_asc', 'price_desc', 'rating', 'popular'];

async function listProducts({ page = 1, limit = 20, categoryId, minPrice, maxPrice, sort = 'newest', search, isFeatured, inStock } = {}) {
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  if (!VALID_SORTS.includes(sort)) sort = 'newest';
  if (minPrice != null) minPrice = Number(minPrice);
  if (maxPrice != null) maxPrice = Number(maxPrice);

  return productRepo.findAll({ page, limit, categoryId, minPrice, maxPrice, sort, search, isFeatured, inStock });
}

async function getProduct(id) {
  const product = await productRepo.findById(id);
  if (!product) throw new ApiError(404, '상품을 찾을 수 없습니다.');
  return product;
}

module.exports = { listProducts, getProduct };
