const { faker } = require('@faker-js/faker/locale/ko');
const { createHash, randomUUID } = require('crypto');

const TOTAL = 1000;
const CHUNK = 500;
const sha256 = (s) => createHash('sha256').update(s).digest('hex');

/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  await knex('tokens').del();
  await knex('users').del();

  const rows = [];
  for (let i = 0; i < TOTAL; i++) {
    const sex = faker.person.sexType();
    rows.push({
      id: randomUUID(),
      name: faker.person.fullName({ sex }),
      email: faker.internet.email({ allowSpecialCharacters: false }).toLowerCase(),
      password_hash: sha256('test1234'),
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
