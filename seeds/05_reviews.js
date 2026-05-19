const { faker } = require('@faker-js/faker/locale/ko');
const { randomUUID } = require('crypto');

const TOTAL = 100000;
const CHUNK = 2000;

const REVIEW_TITLES = [
  '정말 만족해요!', '가성비 최고', '배송도 빠르고 품질도 좋아요', '재구매 의사 있음',
  '생각보다 훨씬 좋네요', '사진이랑 똑같아요', '추천합니다', '조금 아쉬운 점이 있어요',
  '보통이에요', '기대 이상입니다', '가격 대비 훌륭해요', '친구한테도 추천했어요',
  '처음에 걱정했는데 괜찮아요', '포장도 꼼꼼하게 잘 왔어요', '오래 쓸 것 같아요',
  '디자인이 예뻐요', '내구성이 좋아요', '다음에 또 살게요', '색이 예뻐요', '실망이에요',
];

/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  await knex('reviews').del();

  const users = await knex('users').select('id', 'name');
  const productIds = (await knex('products').select('id')).map((p) => p.id);

  if (users.length === 0 || productIds.length === 0) {
    console.error('[seed] users 또는 products가 없습니다.');
    return;
  }

  // 중복 방지용 (product_id, user_id) 유니크 제약 때문에 세트로 추적
  const seen = new Set();
  const rows = [];

  let attempts = 0;
  const maxAttempts = TOTAL * 3;

  while (rows.length < TOTAL && attempts < maxAttempts) {
    attempts++;
    const user = faker.helpers.arrayElement(users);
    const productId = faker.helpers.arrayElement(productIds);
    const key = `${productId}:${user.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const rating = faker.helpers.weightedArrayElement([
      { weight: 5, value: 5 },
      { weight: 20, value: 5 },
      { weight: 30, value: 4 },
      { weight: 25, value: 4 },
      { weight: 15, value: 3 },
      { weight: 4, value: 2 },
      { weight: 1, value: 1 },
    ]);

    rows.push({
      id: randomUUID(),
      product_id: productId,
      user_id: user.id,
      user_name: user.name,
      rating,
      title: faker.helpers.arrayElement(REVIEW_TITLES),
      content: faker.lorem.sentences({ min: 1, max: 4 }),
      helpful: faker.number.int({ min: 0, max: 150 }),
      created_at: faker.date.between({ from: '2022-01-01', to: new Date() }),
      updated_at: new Date(),
    });

    if (rows.length % CHUNK === 0) {
      await knex('reviews').insert(rows.splice(0, CHUNK));
      process.stdout.write(`\r[seed] reviews: ${seen.size}/${TOTAL}건 처리 중...`);
    }
  }

  if (rows.length > 0) {
    await knex('reviews').insert(rows);
  }

  console.log(`\n[seed] reviews: ${seen.size}건 삽입 완료`);
};
