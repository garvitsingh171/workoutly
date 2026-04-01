const bcrypt = require('bcrypt');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please add all fields', 400));
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new AppError('User already exists', 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    if (user) {
      return res.status(201).json({
        success: true,
        _id: user.id,
        name: user.name,
        email: user.email,
      });
    }

    return next(new AppError('Invalid user data', 400));
  } catch (error) {
    return next(error);
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res, next) => {
  try {
    // Exclude passwords
    const users = await User.find({});
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get a user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res, next) => {
  try {
    if (req.user && req.params.id !== String(req.user._id)) {
      return next(new AppError('You can only view your own profile', 403));
    }

    const user = await User.findById(req.params.id);

    if (user) {
      return res.status(200).json({
        success: true,
        data: user,
      });
    }

    return next(new AppError('User not found', 404));
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return next(new AppError('User not found', 404));
    }
    return next(error);
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Public
const updateUser = async (req, res, next) => {
  try {
    if (req.user && req.params.id !== String(req.user._id)) {
      return next(new AppError('You can only update your own profile', 403));
    }

    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      return res.status(200).json({
        success: true,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
    }

    return next(new AppError('User not found', 404));
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return next(new AppError('User not found', 404));
    }
    return next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Public
const deleteUser = async (req, res, next) => {
  try {
    if (req.user && req.params.id !== String(req.user._id)) {
      return next(new AppError('You can only delete your own profile', 403));
    }

    const user = await User.findById(req.params.id);

    if (user) {
      await User.deleteOne({ _id: user._id });
      return res.status(200).json({
        success: true,
        message: 'User removed',
      });
    }

    return next(new AppError('User not found', 404));
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return next(new AppError('User not found', 404));
    }
    return next(error);
  }
};

module.exports = {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
