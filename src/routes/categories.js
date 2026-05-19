const express = require('express');
const router = express.Router();
const { productRepo } = require('../repositories');

// 카테고리 목록은 메모리에서 직접 관리 (DB 붙이면 categoryRepo로 교체)
const CATEGORIES = [
  { id: 'cat-01', name: '스마트폰/태블릿', slug: 'smartphones', description: '최신 스마트폰과 태블릿' },
  { id: 'cat-02', name: '노트북/PC', slug: 'laptops', description: '노트북, 데스크탑, 모니터' },
  { id: 'cat-03', name: '음향기기', slug: 'audio', description: '이어폰, 헤드폰, 스피커' },
  { id: 'cat-04', name: '카메라/촬영', slug: 'cameras', description: '디지털카메라, 액션캠, 드론' },
  { id: 'cat-05', name: '주변기기/액세서리', slug: 'accessories', description: '키보드, 마우스, 충전기' },
  { id: 'cat-06', name: '남성의류', slug: 'mens-fashion', description: '남성 의류 전 품목' },
  { id: 'cat-07', name: '여성의류', slug: 'womens-fashion', description: '여성 의류 전 품목' },
  { id: 'cat-08', name: '스포츠웨어', slug: 'sportswear', description: '운동복, 레깅스, 트레이닝복' },
  { id: 'cat-09', name: '신발', slug: 'shoes', description: '운동화, 구두, 슬리퍼' },
  { id: 'cat-10', name: '가방/잡화', slug: 'bags', description: '백팩, 크로스백, 지갑' },
  { id: 'cat-11', name: '주방용품', slug: 'kitchen', description: '조리도구, 식기, 주방가전' },
  { id: 'cat-12', name: '욕실/청소', slug: 'bathroom', description: '세면용품, 청소용품, 세탁용품' },
  { id: 'cat-13', name: '식품/건강식품', slug: 'food', description: '신선식품, 건강기능식품, 유기농' },
  { id: 'cat-14', name: '음료/커피', slug: 'beverages', description: '커피, 차, 주스, 음료수' },
  { id: 'cat-15', name: 'IT도서', slug: 'it-books', description: '프로그래밍, 개발, IT 전문서' },
  { id: 'cat-16', name: '자기계발/경제', slug: 'self-help', description: '자기계발, 경제, 경영 도서' },
  { id: 'cat-17', name: '소설/에세이', slug: 'fiction', description: '소설, 에세이, 시' },
  { id: 'cat-18', name: '스포츠용품', slug: 'sports', description: '운동기구, 아웃도어, 레저' },
  { id: 'cat-19', name: '가구', slug: 'furniture', description: '침대, 소파, 책상, 의자' },
  { id: 'cat-20', name: '인테리어/조명', slug: 'interior', description: '조명, 러그, 커튼, 소품' },
];

// GET /categories
router.get('/', async (req, res, next) => {
  try {
    const result = await productRepo.findAll({ limit: 9999 });
    const countMap = {};
    for (const p of result.items) {
      countMap[p.categoryId] = (countMap[p.categoryId] || 0) + 1;
    }
    const data = CATEGORIES.map((c) => ({ ...c, productCount: countMap[c.id] || 0 }));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /categories/:id/products
router.get('/:id/products', async (req, res, next) => {
  try {
    const { page, limit, sort, minPrice, maxPrice, search, inStock } = req.query;
    const productService = require('../services/productService');
    const result = await productService.listProducts({
      page, limit, sort, minPrice, maxPrice, search,
      categoryId: req.params.id,
      inStock: inStock === 'true' ? true : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
