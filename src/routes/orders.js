const express = require("express");
const router = express.Router();
const { orders, cart } = require("../data/dummy");

// POST /orders  — 현재 장바구니로 주문 생성
router.post("/", (req, res) => {
  if (cart.length === 0) {
    return res.status(400).json({ success: false, message: "장바구니가 비어 있습니다." });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    orderId: Date.now(),
    items: [...cart],
    total,
    status: "결제완료",
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  cart.length = 0;

  res.status(201).json({ success: true, data: order });
});

// GET /orders/:orderId
router.get("/:orderId", (req, res) => {
  const order = orders.find((o) => o.orderId === Number(req.params.orderId));
  if (!order) {
    return res.status(404).json({ success: false, message: "주문을 찾을 수 없습니다." });
  }
  res.json({ success: true, data: order });
});

module.exports = router;
