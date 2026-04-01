const AppError = require('../utils/AppError');

const normalizeError = (err) => {
  if (err instanceof AppError) {
    return err;
  }

  if (err.name === 'ValidationError') {
    const firstMessage = Object.values(err.errors || {})[0]?.message || 'Validation failed';
    return new AppError(firstMessage, 400);
  }

  if (err.name === 'CastError') {
    return new AppError('Resource not found', 404);
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    return new AppError(`${duplicateField} already exists`, 400);
  }

  return new AppError('Something went wrong. Please try again.', 500);
};

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  const normalizedError = normalizeError(err);
  const statusCode = normalizedError.statusCode || 500;

  console.error('API Error:', {
    message: err.message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    message: normalizedError.message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};