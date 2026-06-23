const User = require('../models/User');
const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/token');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized, no token', 401));
    }

    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      return next(new AppError('User not found', 401));
    }

    return next();
  } catch (error) {
    return next(new AppError('Not authorized, token failed', 401));
  }
};

module.exports = { protect };
