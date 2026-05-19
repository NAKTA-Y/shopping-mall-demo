const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { requireAuth } = require('../middleware/auth');

// POST /users/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, zipCode, addressLine1, addressLine2 } = req.body;
    const result = await userService.register({ name, email, password, phone, zipCode, addressLine1, addressLine2 });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /users/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await userService.login({ email, password });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /users/logout
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await userService.logout(req.token);
    res.json({ success: true, message: '로그아웃 되었습니다.' });
  } catch (err) {
    next(err);
  }
});

// GET /users/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await userService.getMe(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// PATCH /users/me
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, phone, zipCode, addressLine1, addressLine2 } = req.body;
    const user = await userService.updateMe(req.user.id, { name, phone, zipCode, addressLine1, addressLine2 });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
