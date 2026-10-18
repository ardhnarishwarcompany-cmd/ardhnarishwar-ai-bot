const express = require('express');
const router = express.Router();
const { login, me, changePassword } = require('../controllers/authController');
const { rateLimit } = require('../middleware/rateLimit');
const { requireAdmin } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', requireAdmin, me);
router.post('/change-password', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), requireAdmin, changePassword);

module.exports = router;
