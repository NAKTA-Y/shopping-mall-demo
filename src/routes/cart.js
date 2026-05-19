const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');
const { requireAuth } = require('../middleware/auth');

// 모든 장바구니 엔드포인트는 인증 필요
router.use(requireAuth);

// GET /cart
router.get('/', async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// POST /cart  { productId, quantity }
router.post('/', async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItem(req.user.id, { productId, quantity });
    res.status(201).json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// PATCH /cart/:cartItemId  { quantity }
router.patch('/:cartItemId', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateItem(req.user.id, req.params.cartItemId, { quantity });
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// DELETE /cart/:cartItemId
router.delete('/:cartItemId', async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.cartItemId);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// DELETE /cart  (전체 비우기)
router.delete('/', async (req, res, next) => {
  try {
    await cartService.clearCart(req.user.id);
    res.json({ success: true, message: '장바구니를 비웠습니다.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
