const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const firstError = errors.array({ onlyFirstError: true })[0];
  return next(new AppError(firstError.msg || 'Invalid request data', 400));
};

module.exports = validateRequest;
