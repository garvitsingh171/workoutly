const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');

const REFRESH_COOKIE_NAME = 'refreshToken';

const getRefreshCookieMaxAge = () => {
  const refreshExpire = process.env.JWT_REFRESH_EXPIRE || '7d';
  const match = /^(\d+)([dhm])$/.exec(refreshExpire);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2];

  if (unit === 'd') return value * 24 * 60 * 60 * 1000;
  if (unit === 'h') return value * 60 * 60 * 1000;
  return value * 60 * 1000;
};

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
});

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...getRefreshCookieOptions(),
    maxAge: getRefreshCookieMaxAge(),
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
};

// @desc    Register a new user
// @route   POST /api/auth/register and POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    const { token, user } = result;

    return sendSuccess(res, 201, 'Registration successful', result, {
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { token, refreshToken, user } = await authService.loginUser(req.body);

    if (refreshToken) {
      setRefreshCookie(res, refreshToken);
    }

    return sendSuccess(res, 200, 'Login successful', { token, user }, {
      token,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(req.cookies?.refreshToken);

    return sendSuccess(res, 200, 'Token refreshed successfully', result, {
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
  try {
    clearRefreshCookie(res);

    return sendSuccess(res, 200, 'Logout successful');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
};
