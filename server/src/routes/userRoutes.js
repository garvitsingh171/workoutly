const express = require('express');
const router = express.Router();
const {
  registerUser,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { registerValidator } = require('../validators/authValidators');
const { userIdValidator, updateUserValidator } = require('../validators/userValidators');
const validateRequest = require('../validators/validateRequest');
const { authLimiter } = require('../middleware/rateLimiters');

// /api/users routes
router.post('/register', authLimiter, registerValidator, validateRequest, registerUser);
router
  .route('/:id')
  .get(protect, userIdValidator, validateRequest, getUserById)
  .put(protect, userIdValidator, updateUserValidator, validateRequest, updateUser)
  .delete(protect, userIdValidator, validateRequest, deleteUser);

module.exports = router;
