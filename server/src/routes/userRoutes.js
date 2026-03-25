const express = require('express');
const router = express.Router();
const {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// /api/users routes
router.route('/').get(getUsers);
router.post('/register', registerUser);
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;
