const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewService = require('../services/reviewService');
const { requireAuth } = require('../middleware/auth');

// GET /products/:productId/reviews?page=1&limit=10&sort=newest
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, sort } = req.query;
    const result = await reviewService.listReviews(req.params.productId, { page, limit, sort });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /products/:productId/reviews
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { rating, title, content } = req.body;
    const review = await reviewService.createReview(
      req.user.id,
      req.user.name,
      { productId: req.params.productId, rating, title, content },
    );
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
