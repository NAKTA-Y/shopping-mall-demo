const { cartRepo, productRepo } = require('../repositories');
const ApiError = require('../utils/ApiError');

async function getCart(userId) {
  return cartRepo.findByUserId(userId);
}

async function addItem(userId, { productId, quantity = 1 }) {
  if (!productId) throw new ApiError(400, 'productId는 필수입니다.');
  quantity = parseInt(quantity);
  if (!quantity || quantity < 1) throw new ApiError(400, '수량은 1 이상이어야 합니다.');

  const product = await productRepo.findById(productId);
  if (!product) throw new ApiError(404, '상품을 찾을 수 없습니다.');
  if (product.stock < quantity) throw new ApiError(400, '재고가 부족합니다.');

  return cartRepo.upsertItem(userId, {
    productId,
    name: product.name,
    price: product.price,
    image: product.images?.[0] || null,
    quantity,
  });
}

async function updateItem(userId, cartItemId, { quantity }) {
  quantity = parseInt(quantity);
  if (!quantity || quantity < 1) throw new ApiError(400, '수량은 1 이상이어야 합니다.');

  const result = await cartRepo.updateItemQuantity(userId, cartItemId, quantity);
  if (!result) throw new ApiError(404, '장바구니 항목을 찾을 수 없습니다.');
  return result;
}

async function removeItem(userId, cartItemId) {
  const result = await cartRepo.removeItem(userId, cartItemId);
  if (!result) throw new ApiError(404, '장바구니 항목을 찾을 수 없습니다.');
  return result;
}

async function clearCart(userId) {
  await cartRepo.clear(userId);
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
