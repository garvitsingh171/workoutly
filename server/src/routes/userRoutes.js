const express = require('express');
const router = express.Router();
const {
  registerUser,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// /api/users routes
router.post('/register', registerUser);
router.route('/:id').get(protect, getUserById).put(protect, updateUser).delete(protect, deleteUser);

module.exports = router;
