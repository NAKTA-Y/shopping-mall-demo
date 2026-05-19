const { IUserRepository } = require('../interfaces');
const { randomUUID } = require('crypto');

class MemoryUserRepository extends IUserRepository {
  constructor() {
    super();
    /** @type {Map<string, object>} */
    this._store = new Map();
  }

  async findById(id) {
    return this._store.get(id) || null;
  }

  async findByEmail(email) {
    for (const user of this._store.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async create({ name, email, passwordHash, phone, zipCode, addressLine1, addressLine2 }) {
    const user = {
      id: randomUUID(),
      name, email, passwordHash, phone,
      address: { zipCode, line1: addressLine1, line2: addressLine2 },
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    this._store.set(user.id, user);
    return user;
  }

  async update(id, data) {
    const user = this._store.get(id);
    if (!user) return null;
    Object.assign(user, data);
    return user;
  }
}

module.exports = MemoryUserRepository;
