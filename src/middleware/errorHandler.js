const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  console.error('[ERROR]', err);
  res.status(500).json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
}

module.exports = errorHandler;
