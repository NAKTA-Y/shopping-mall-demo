const { faker } = require('@faker-js/faker/locale/ko');
const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');

const TOTAL = 1000;
const CHUNK = 500;

/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('tokens').del();
  await knex('users').del();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  // 모든 유저 비밀번호 동일 → 한 번만 해시 계산
  const passwordHash = await bcrypt.hash('test1234', 12);

  const rows = [];
  const usedEmails = new Set();
  while (rows.length < TOTAL) {
    const sex = faker.person.sexType();
    const email = faker.internet.email({ allowSpecialCharacters: false }).toLowerCase();
    if (usedEmails.has(email)) continue;
    usedEmails.add(email);
    rows.push({
      id: randomUUID(),
      name: faker.person.fullName({ sex }),
      email,
      password_hash: passwordHash,
      phone: faker.phone.number('010-####-####'),
      zip_code: faker.location.zipCode('#####'),
      address_line1: `${faker.location.city()} ${faker.location.streetAddress()}`,
      address_line2: `${faker.number.int({ min: 1, max: 30 })}동 ${faker.number.int({ min: 101, max: 2503 })}호`,
      role: 'customer',
      created_at: faker.date.between({ from: '2022-01-01', to: new Date() }),
      updated_at: new Date(),
    });
  }

  for (let i = 0; i < rows.length; i += CHUNK) {
    await knex('users').insert(rows.slice(i, i + CHUNK));
  }

  console.log(`[seed] users: ${TOTAL}건 삽입 완료`);
};
