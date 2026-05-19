const db = require('./db');
const { ITokenRepository } = require('../interfaces');
const { randomBytes } = require('crypto');

const TOKEN_TTL_DAYS = 7;

class MySQLTokenRepository extends ITokenRepository {
  async create(userId) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await db('tokens').insert({ token, user_id: userId, expires_at: expiresAt });
    return token;
  }

  async findUserId(token) {
    const row = await db('tokens')
      .where('token', token)
      .where('expires_at', '>', new Date())
      .first();
    return row ? row.user_id : null;
  }

  async delete(token) {
    await db('tokens').where('token', token).del();
  }

  async deleteByUserId(userId) {
    await db('tokens').where('user_id', userId).del();
  }
}

module.exports = MySQLTokenRepository;
