const products = [
  { id: 1, name: "무선 블루투스 이어폰", price: 59000, stock: 120, category: "전자기기", description: "고음질 무선 이어폰" },
  { id: 2, name: "스마트 워치", price: 199000, stock: 45, category: "전자기기", description: "다양한 건강 지표 측정 가능" },
  { id: 3, name: "코튼 티셔츠", price: 19000, stock: 300, category: "의류", description: "부드러운 순면 소재" },
  { id: 4, name: "캐주얼 청바지", price: 49000, stock: 80, category: "의류", description: "슬림핏 스트레치 데님" },
  { id: 5, name: "텀블러 500ml", price: 24000, stock: 200, category: "생활용품", description: "보온·보냉 스테인리스 텀블러" },
];

const cart = [];

const orders = [];

module.exports = { products, cart, orders };
