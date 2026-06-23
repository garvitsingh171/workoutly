const { body, param } = require('express-validator');

const workoutIdValidator = [
  param('id').isMongoId().withMessage('Invalid workout id'),
];

const workoutValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Workout name is required')
    .isLength({ max: 100 })
    .withMessage('Workout name cannot exceed 100 characters'),
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 1, max: 600 })
    .withMessage('Duration must be between 1 and 600 minutes')
    .toInt(),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('coverImage')
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage('Cover image must be a valid URL'),
  body('exercises')
    .isArray({ min: 1 })
    .withMessage('At least one exercise is required'),
  body('exercises.*.name')
    .trim()
    .notEmpty()
    .withMessage('Exercise name is required'),
  body('exercises.*.sets')
    .isInt({ min: 1, max: 20 })
    .withMessage('Exercise sets must be between 1 and 20')
    .toInt(),
  body('exercises.*.reps')
    .isInt({ min: 1, max: 100 })
    .withMessage('Exercise reps must be between 1 and 100')
    .toInt(),
];

module.exports = {
  workoutIdValidator,
  workoutValidator,
};
