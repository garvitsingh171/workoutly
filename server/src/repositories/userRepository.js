const User = require('../models/User');

const createUser = (userData) => {
  return User.create(userData);
};

const findUserByEmail = (email, includePassword = false) => {
  const query = User.findOne({ email });

  if (includePassword) {
    query.select('+password');
  }

  return query;
};

const findUserById = (userId) => {
  return User.findById(userId);
};

const saveUser = (user) => {
  return user.save();
};

const deleteUserById = (userId) => {
  return User.deleteOne({ _id: userId });
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  saveUser,
  deleteUserById,
};
