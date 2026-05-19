const { faker } = require('@faker-js/faker/locale/ko');
const { randomUUID } = require('crypto');

const TOTAL = 1000;
const CHUNK = 200;

// 카테고리별 상품 이름 템플릿
const PRODUCT_TEMPLATES = {
  'cat-01': ['갤럭시 스마트폰', '아이폰 케이스', '태블릿 PC', '스마트폰 거치대', '화면보호필름'],
  'cat-02': ['울트라슬림 노트북', '게이밍 노트북', '4K 모니터', '미니 PC', '노트북 스탠드'],
  'cat-03': ['무선 블루투스 이어폰', '노이즈캔슬링 헤드폰', '포터블 스피커', '게이밍 헤드셋', '이어버드'],
  'cat-04': ['미러리스 카메라', '액션캠', 'DSLR 렌즈', '삼각대', '짐벌 스태빌라이저'],
  'cat-05': ['기계식 키보드', '무선 마우스', 'GaN 충전기', 'USB 허브', '웹캠'],
  'cat-06': ['슬림핏 청바지', '캐주얼 셔츠', '후드 티셔츠', '치노 팬츠', '항공점퍼'],
  'cat-07': ['플리츠 스커트', '니트 가디건', '원피스', '와이드 팬츠', '블라우스'],
  'cat-08': ['압축 레깅스', '드라이핏 반팔', '트레이닝 바지', '요가복 세트', '기능성 재킷'],
  'cat-09': ['경량 러닝화', '캐주얼 스니커즈', '등산화', '슬리퍼', '로퍼'],
  'cat-10': ['캔버스 백팩', '크로스백', '토트백', '여행용 캐리어', '카드 지갑'],
  'cat-11': ['스테인리스 프라이팬', '도마 세트', '에어프라이어', '텀블러', '식기 세트'],
  'cat-12': ['천연 비누', '아로마 디퓨저', '세탁 세제', '청소 스프레이', '욕실 발매트'],
  'cat-13': ['유기농 현미', '제주 감귤', '혼합 견과류', '프로바이오틱스', '콜라겐 분말'],
  'cat-14': ['스페셜티 원두', '제주 녹차', '콜드브루', '비타민 워터', '프리미엄 꿀'],
  'cat-15': ['클린 코드', '객체지향 설계', '파이썬 완벽 가이드', '리액트 입문', '도커/쿠버네티스'],
  'cat-16': ['부의 추월차선', '미라클 모닝', '원씽', '돈의 심리학', '하버드 강의'],
  'cat-17': ['채식주의자', '82년생 김지영', '아몬드', '소년이 온다', '달러구트 꿈 백화점'],
  'cat-18': ['요가 매트', '조절식 덤벨', '폼롤러', '줄넘기', '스쿼트 밴드'],
  'cat-19': ['원목 1인 책상', '패브릭 소파', '수납 침대 프레임', '컴퓨터 의자', '선반 책장'],
  'cat-20': ['LED 스트립 조명', '북유럽 행거', '인테리어 화분', '원형 거울', '벽시계'],
};

const CAT_IDS = Object.keys(PRODUCT_TEMPLATES);

/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  await knex('reviews').del();
  await knex('order_items').del();
  await knex('orders').del();
  await knex('cart_items').del();
  await knex('products').del();

  const rows = [];
  for (let i = 0; i < TOTAL; i++) {
    const catId = CAT_IDS[i % CAT_IDS.length];
    const templates = PRODUCT_TEMPLATES[catId];
    const baseName = templates[Math.floor(Math.random() * templates.length)];
    const suffix = faker.commerce.productAdjective();
    const price = faker.number.int({ min: 5000, max: 1500000 });
    const discountRate = faker.helpers.arrayElement([0, 0, 0.05, 0.1, 0.15, 0.2, 0.3]);
    const originalPrice = Math.round(price / (1 - discountRate) / 100) * 100 || price;
    const soldCount = faker.number.int({ min: 0, max: 5000 });
    const reviewCount = Math.floor(soldCount * faker.number.float({ min: 0.05, max: 0.4 }));
    const rating = reviewCount > 0
      ? Math.round(faker.number.float({ min: 3.0, max: 5.0 }) * 10) / 10
      : 0;

    rows.push({
      id: randomUUID(),
      category_id: catId,
      name: `${suffix} ${baseName} ${faker.commerce.productMaterial()}`,
      description: faker.commerce.productDescription(),
      price,
      original_price: originalPrice,
      stock: faker.number.int({ min: 0, max: 500 }),
      rating,
      review_count: reviewCount,
      sold_count: soldCount,
      is_featured: Math.random() < 0.1,
      is_new: Math.random() < 0.15,
      tags: JSON.stringify(faker.helpers.arrayElements(
        ['인기', '추천', '할인', '신상', '무료배송', '한정수량', '베스트셀러'],
        { min: 1, max: 3 },
      )),
      images: JSON.stringify([`/images/${randomUUID()}.jpg`]),
      created_at: faker.date.between({ from: '2021-01-01', to: new Date() }),
      updated_at: new Date(),
    });
  }

  for (let i = 0; i < rows.length; i += CHUNK) {
    await knex('products').insert(rows.slice(i, i + CHUNK));
  }

  console.log(`[seed] products: ${TOTAL}건 삽입 완료`);
};
