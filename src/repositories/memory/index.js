const MemoryProductRepository = require('./ProductRepository');
const MemoryUserRepository = require('./UserRepository');
const MemoryTokenRepository = require('./TokenRepository');
const MemoryCartRepository = require('./CartRepository');
const MemoryOrderRepository = require('./OrderRepository');
const MemoryReviewRepository = require('./ReviewRepository');

module.exports = {
  productRepo: new MemoryProductRepository(),
  userRepo: new MemoryUserRepository(),
  tokenRepo: new MemoryTokenRepository(),
  cartRepo: new MemoryCartRepository(),
  orderRepo: new MemoryOrderRepository(),
  reviewRepo: new MemoryReviewRepository(),
};
