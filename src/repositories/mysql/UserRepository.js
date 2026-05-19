const db = require('./db');
const { IUserRepository } = require('../interfaces');
const { randomUUID } = require('crypto');

class MySQLUserRepository extends IUserRepository {
  async findById(id) {
    const row = await db('users').where('id', id).first();
    return row ? toUser(row) : null;
  }

  async findByEmail(email) {
    const row = await db('users').where('email', email).first();
    return row ? toUser(row) : null;
  }

  async create({ name, email, passwordHash, phone, zipCode, addressLine1, addressLine2 }) {
    const id = randomUUID();
    await db('users').insert({
      id, name, email,
      password_hash: passwordHash,
      phone,
      zip_code: zipCode,
      address_line1: addressLine1,
      address_line2: addressLine2,
      role: 'customer',
    });
    return this.findById(id);
  }

  async update(id, { name, phone, address }) {
    await db('users').where('id', id).update({
      ...(name && { name }),
      ...(phone && { phone }),
      ...(address?.zipCode && { zip_code: address.zipCode }),
      ...(address?.line1 && { address_line1: address.line1 }),
      ...(address?.line2 !== undefined && { address_line2: address.line2 }),
    });
    return this.findById(id);
  }
}

function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone,
    address: {
      zipCode: row.zip_code,
      line1: row.address_line1,
      line2: row.address_line2,
    },
    role: row.role,
    createdAt: row.created_at,
  };
}

module.exports = MySQLUserRepository;
