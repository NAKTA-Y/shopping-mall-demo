/**
 * 모든 Repository 구현체가 따라야 하는 추상 인터페이스.
 * MySQL 구현체를 추가할 때 이 클래스를 상속하고 각 메서드를 구현하면 됩니다.
 */

class IProductRepository {
  /** @returns {{ items: any[], total: number }} */
  async findAll({ page, limit, categoryId, minPrice, maxPrice, sort, search, isFeatured, inStock }) { throw new Error('Not implemented'); }
  /** @returns {any|null} */
  async findById(id) { throw new Error('Not implemented'); }
  async decrementStock(id, quantity) { throw new Error('Not implemented'); }
  async incrementStock(id, quantity) { throw new Error('Not implemented'); }
}

class IUserRepository {
  async findById(id) { throw new Error('Not implemented'); }
  async findByEmail(email) { throw new Error('Not implemented'); }
  async create({ name, email, passwordHash, phone, zipCode, addressLine1, addressLine2 }) { throw new Error('Not implemented'); }
  async update(id, data) { throw new Error('Not implemented'); }
}

class ITokenRepository {
  /** 토큰 생성 후 토큰 문자열 반환 */
  async create(userId) { throw new Error('Not implemented'); }
  /** 토큰으로 userId 조회. 만료 또는 없으면 null */
  async findUserId(token) { throw new Error('Not implemented'); }
  async delete(token) { throw new Error('Not implemented'); }
  async deleteByUserId(userId) { throw new Error('Not implemented'); }
}

class ICartRepository {
  /** @returns {{ items: any[], totalAmount: number }} */
  async findByUserId(userId) { throw new Error('Not implemented'); }
  /** 이미 있으면 수량 합산, 없으면 추가 */
  async upsertItem(userId, { productId, name, price, image, quantity }) { throw new Error('Not implemented'); }
  async updateItemQuantity(userId, cartItemId, quantity) { throw new Error('Not implemented'); }
  async removeItem(userId, cartItemId) { throw new Error('Not implemented'); }
  async clear(userId) { throw new Error('Not implemented'); }
}

class IOrderRepository {
  async create({ userId, items, totalAmount, shippingFee, paymentMethod, shippingAddress }) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  /** @returns {{ items: any[], total: number }} */
  async findByUserId(userId, { page, limit }) { throw new Error('Not implemented'); }
  async updateStatus(id, status) { throw new Error('Not implemented'); }
}

class IReviewRepository {
  /** @returns {{ items: any[], total: number }} */
  async findByProductId(productId, { page, limit, sort }) { throw new Error('Not implemented'); }
  async create({ productId, userId, userName, rating, title, content }) { throw new Error('Not implemented'); }
  async existsByUserAndProduct(userId, productId) { throw new Error('Not implemented'); }
}

module.exports = {
  IProductRepository,
  IUserRepository,
  ITokenRepository,
  ICartRepository,
  IOrderRepository,
  IReviewRepository,
};
