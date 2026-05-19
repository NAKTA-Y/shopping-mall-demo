const { createHash } = require('crypto');
const { userRepo, tokenRepo } = require('../repositories');
const ApiError = require('../utils/ApiError');

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

async function register({ name, email, password, phone, zipCode, addressLine1, addressLine2 }) {
  if (!name || !email || !password) throw new ApiError(400, 'name, email, password는 필수입니다.');
  if (password.length < 8) throw new ApiError(400, '비밀번호는 8자 이상이어야 합니다.');

  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ApiError(409, '이미 사용 중인 이메일입니다.');

  const user = await userRepo.create({
    name, email, passwordHash: sha256(password),
    phone, zipCode, addressLine1, addressLine2,
  });

  const token = await tokenRepo.create(user.id);
  return { user: sanitize(user), token };
}

async function login({ email, password }) {
  if (!email || !password) throw new ApiError(400, 'email과 password는 필수입니다.');

  const user = await userRepo.findByEmail(email);
  if (!user || user.passwordHash !== sha256(password)) {
    throw new ApiError(401, '이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const token = await tokenRepo.create(user.id);
  return { user: sanitize(user), token };
}

async function logout(token) {
  await tokenRepo.delete(token);
}

async function getMe(userId) {
  const user = await userRepo.findById(userId);
  if (!user) throw new ApiError(404, '사용자를 찾을 수 없습니다.');
  return sanitize(user);
}

async function updateMe(userId, { name, phone, zipCode, addressLine1, addressLine2 }) {
  const updated = await userRepo.update(userId, { name, phone, address: { zipCode, line1: addressLine1, line2: addressLine2 } });
  if (!updated) throw new ApiError(404, '사용자를 찾을 수 없습니다.');
  return sanitize(updated);
}

function sanitize(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = { register, login, logout, getMe, updateMe };
