const express = require("express");
const router = express.Router();
const { products } = require("../data/dummy");

// GET /products?category=전자기기
router.get("/", (req, res) => {
  const { category } = req.query;
  const result = category
    ? products.filter((p) => p.category === category)
    : products;
  res.json({ success: true, data: result });
});

// GET /products/:id
router.get("/:id", (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, message: "상품을 찾을 수 없습니다." });
  }
  res.json({ success: true, data: product });
});

module.exports = router;
