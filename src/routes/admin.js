const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const { requireAuth } = require('../middleware/auth');
const ApiError = require('../utils/ApiError');

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return next(new ApiError(403, '관리자 권한이 필요합니다.'));
  }
  next();
}

router.use(requireAuth, requireAdmin);

// GET /admin/stats/summary
router.get('/stats/summary', async (req, res, next) => {
  try {
    const data = await adminService.getSummary();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /admin/stats/users?page=1&limit=20
router.get('/stats/users', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await adminService.getUserStats({ page, limit });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /admin/stats/categories
router.get('/stats/categories', async (req, res, next) => {
  try {
    const data = await adminService.getCategoryStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
