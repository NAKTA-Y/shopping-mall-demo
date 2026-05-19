const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 요청 로깅
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/users', require('./routes/users'));
app.use('/categories', require('./routes/categories'));
app.use('/products', require('./routes/products'));
app.use('/products/:productId/reviews', require('./routes/reviews'));
app.use('/cart', require('./routes/cart'));
app.use('/orders', require('./routes/orders'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: '요청한 경로를 찾을 수 없습니다.' });
});

app.use(require('./middleware/errorHandler'));

app.listen(PORT, () => {
  console.log(`Shopping Mall API running on port ${PORT}`);
  console.log('현재 구현체: in-memory (DB 연결 시 src/repositories/index.js 교체)');
});
