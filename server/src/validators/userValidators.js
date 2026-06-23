const { body, param } = require('express-validator');

const userIdValidator = [
  param('id').isMongoId().withMessage('Invalid user id'),
];

const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

module.exports = {
  userIdValidator,
  updateUserValidator,
};
