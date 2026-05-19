const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

// GET /products?page=1&limit=20&categoryId=cat-01&minPrice=10000&maxPrice=100000&sort=popular&search=노트북&isFeatured=true&inStock=true
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, categoryId, minPrice, maxPrice, sort, search } = req.query;
    const isFeatured = req.query.isFeatured === 'true' ? true : undefined;
    const inStock = req.query.inStock === 'true' ? true : undefined;

    const result = await productService.listProducts({ page, limit, categoryId, minPrice, maxPrice, sort, search, isFeatured, inStock });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// GET /products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.getProduct(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
