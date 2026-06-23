const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
const userRepository = require('../repositories/userRepository');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/token');

const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userRepository.findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await userRepository.createUser({
    name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  const token = generateAccessToken(user._id);
  return {
    token,
    user: buildUserResponse(user),
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findUserByEmail(normalizedEmail, true);

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError('Invalid email or password', 401);
  }

  return {
    token: generateAccessToken(user._id),
    refreshToken: generateRefreshToken(user._id),
    user: buildUserResponse(user),
  };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token missing', 401);
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Invalid refresh token', 401);
  }

  const user = await userRepository.findUserById(decoded.userId);

  if (!user) {
    throw new AppError('User not found', 401);
  }

  return {
    token: generateAccessToken(user._id),
    user: buildUserResponse(user),
  };
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  buildUserResponse,
};
