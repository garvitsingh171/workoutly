const { registerUser } = require('./authController');
const userService = require('../services/userService');
const { sendSuccess } = require('../utils/apiResponse');

// @desc    Get a user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user._id);

    return sendSuccess(res, 200, 'User fetched successfully', user);
  } catch (error) {
    return next(error);
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.user._id, req.body);

    return sendSuccess(res, 200, 'User updated successfully', {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    }, {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user._id);

    return sendSuccess(res, 200, 'User removed');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  getUserById,
  updateUser,
  deleteUser,
};
