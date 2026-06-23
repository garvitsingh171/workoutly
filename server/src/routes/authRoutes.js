const express = require('express');
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const validateRequest = require('../validators/validateRequest');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// /api/auth routes
router.post('/register', authLimiter, registerValidator, validateRequest, registerUser);
router.post('/login', authLimiter, loginValidator, validateRequest, loginUser);
router.post('/refresh', authLimiter, refreshToken);
router.post('/logout', logoutUser);

module.exports = router;
