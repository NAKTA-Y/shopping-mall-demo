const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET /orders?page=1&limit=10
router.get('/', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await orderService.listOrders(req.user.id, { page, limit });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /orders  { paymentMethod, shippingAddress: { zipCode, line1, line2, recipient, phone } }
router.post('/', async (req, res, next) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;
    const order = await orderService.createOrder(req.user.id, { paymentMethod, shippingAddress });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// GET /orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getOrder(req.user.id, req.params.id);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// POST /orders/:id/cancel
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.user.id, req.params.id);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
