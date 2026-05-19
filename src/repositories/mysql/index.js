const MySQLProductRepository = require('./ProductRepository');
const MySQLUserRepository = require('./UserRepository');
const MySQLTokenRepository = require('./TokenRepository');
const MySQLCartRepository = require('./CartRepository');
const MySQLOrderRepository = require('./OrderRepository');
const MySQLReviewRepository = require('./ReviewRepository');

module.exports = {
  productRepo: new MySQLProductRepository(),
  userRepo: new MySQLUserRepository(),
  tokenRepo: new MySQLTokenRepository(),
  cartRepo: new MySQLCartRepository(),
  orderRepo: new MySQLOrderRepository(),
  reviewRepo: new MySQLReviewRepository(),
};
