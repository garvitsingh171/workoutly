const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
const userRepository = require('../repositories/userRepository');

const ensureOwnProfile = (requestedUserId, currentUserId, action) => {
  if (requestedUserId !== String(currentUserId)) {
    throw new AppError(`You can only ${action} your own profile`, 403);
  }
};

const getUserById = async (userId, currentUserId) => {
  ensureOwnProfile(userId, currentUserId, 'view');

  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

const updateUser = async (userId, currentUserId, updates) => {
  ensureOwnProfile(userId, currentUserId, 'update');

  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (updates.name) {
    user.name = updates.name;
  }

  if (updates.email) {
    user.email = updates.email;
  }

  if (updates.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(updates.password, salt);
  }

  return userRepository.saveUser(user);
};

const deleteUser = async (userId, currentUserId) => {
  ensureOwnProfile(userId, currentUserId, 'delete');

  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  await userRepository.deleteUserById(user._id);
};

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
};
