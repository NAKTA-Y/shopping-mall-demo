const { ITokenRepository } = require('../interfaces');
const { randomBytes } = require('crypto');

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일

class MemoryTokenRepository extends ITokenRepository {
  constructor() {
    super();
    /** @type {Map<string, { userId: string, expiresAt: number }>} */
    this._store = new Map();
  }

  async create(userId) {
    const token = randomBytes(32).toString('hex');
    this._store.set(token, { userId, expiresAt: Date.now() + TOKEN_TTL_MS });
    return token;
  }

  async findUserId(token) {
    const entry = this._store.get(token);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(token);
      return null;
    }
    return entry.userId;
  }

  async delete(token) {
    this._store.delete(token);
  }

  async deleteByUserId(userId) {
    for (const [token, entry] of this._store.entries()) {
      if (entry.userId === userId) this._store.delete(token);
    }
  }
}

module.exports = MemoryTokenRepository;
