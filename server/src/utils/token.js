const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('Server configuration error. Please contact support.', 500);
  }

  return process.env.JWT_SECRET;
};

const getRefreshSecret = () => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError('Server refresh token configuration error. Please contact support.', 500);
  }

  return process.env.JWT_REFRESH_SECRET;
};

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, getRefreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
