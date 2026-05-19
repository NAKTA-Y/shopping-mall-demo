const { orderRepo, cartRepo, productRepo } = require('../repositories');
const ApiError = require('../utils/ApiError');

const VALID_STATUSES = ['pending', 'paid', 'shipping', 'delivered', 'cancelled'];

async function createOrder(userId, { paymentMethod, shippingAddress }) {
  if (!shippingAddress?.line1) throw new ApiError(400, '배송지 정보(line1)가 필요합니다.');
  if (!paymentMethod) throw new ApiError(400, 'paymentMethod는 필수입니다.');

  const { items } = await cartRepo.findByUserId(userId);
  if (items.length === 0) throw new ApiError(400, '장바구니가 비어 있습니다.');

  // 재고 확인 및 차감
  for (const item of items) {
    await productRepo.decrementStock(item.productId, item.quantity);
  }

  const shippingFee = items.reduce((sum, i) => sum + i.price * i.quantity, 0) >= 50000 ? 0 : 3000;
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0) + shippingFee;

  const order = await orderRepo.create({
    userId,
    items: items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    })),
    totalAmount,
    shippingFee,
    paymentMethod,
    shippingAddress,
  });

  await cartRepo.clear(userId);
  return order;
}

async function listOrders(userId, { page, limit }) {
  return orderRepo.findByUserId(userId, { page, limit });
}

async function getOrder(userId, orderId) {
  const order = await orderRepo.findById(orderId);
  if (!order) throw new ApiError(404, '주문을 찾을 수 없습니다.');
  if (order.userId !== userId) throw new ApiError(403, '접근 권한이 없습니다.');
  return order;
}

async function cancelOrder(userId, orderId) {
  const order = await orderRepo.findById(orderId);
  if (!order) throw new ApiError(404, '주문을 찾을 수 없습니다.');
  if (order.userId !== userId) throw new ApiError(403, '접근 권한이 없습니다.');
  if (!['pending', 'paid'].includes(order.status)) {
    throw new ApiError(400, `${order.status} 상태의 주문은 취소할 수 없습니다.`);
  }

  // 재고 복구
  for (const item of order.items) {
    await productRepo.incrementStock(item.productId, item.quantity);
  }

  return orderRepo.updateStatus(orderId, 'cancelled');
}

module.exports = { createOrder, listOrders, getOrder, cancelOrder };
