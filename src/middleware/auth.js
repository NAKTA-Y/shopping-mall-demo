const { tokenRepo, userRepo } = require('../repositories');
const ApiError = require('../utils/ApiError');

/**
 * 인증 필수 미들웨어.
 * Authorization: Bearer <token> 헤더를 검사하고 req.user를 설정합니다.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, '인증이 필요합니다.');
    }
    const token = authHeader.slice(7);
    const userId = await tokenRepo.findUserId(token);
    if (!userId) throw new ApiError(401, '유효하지 않거나 만료된 토큰입니다.');

    const user = await userRepo.findById(userId);
    if (!user) throw new ApiError(401, '사용자를 찾을 수 없습니다.');

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * 인증 선택 미들웨어.
 * 토큰이 있으면 req.user를 설정하고, 없으면 그냥 통과합니다.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const userId = await tokenRepo.findUserId(token);
      if (userId) {
        req.user = await userRepo.findById(userId);
        req.token = token;
      }
    }
    next();
  } catch {
    next();
  }
}

module.exports = { requireAuth, optionalAuth };
