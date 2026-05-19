const express = require("express");
const router = express.Router();
const { cart, products } = require("../data/dummy");

// GET /cart
router.get("/", (req, res) => {
  res.json({ success: true, data: cart });
});

// POST /cart  { productId, quantity }
router.post("/", (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find((p) => p.id === Number(productId));

  if (!product) {
    return res.status(404).json({ success: false, message: "상품을 찾을 수 없습니다." });
  }
  if (quantity < 1) {
    return res.status(400).json({ success: false, message: "수량은 1 이상이어야 합니다." });
  }

  const existing = cart.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ cartItemId: Date.now(), productId: product.id, name: product.name, price: product.price, quantity });
  }

  res.status(201).json({ success: true, data: cart });
});

// DELETE /cart/:cartItemId
router.delete("/:cartItemId", (req, res) => {
  const idx = cart.findIndex((item) => item.cartItemId === Number(req.params.cartItemId));
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "장바구니 항목을 찾을 수 없습니다." });
  }
  cart.splice(idx, 1);
  res.json({ success: true, data: cart });
});

module.exports = router;
