const workoutService = require('../services/workoutService');
const { sendSuccess } = require('../utils/apiResponse');

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res, next) => {
  try {
    const workout = await workoutService.createWorkout(req.body, req.user._id);

    return sendSuccess(res, 201, 'Workout created successfully', workout);
  } catch (error) {
    return next(error);
  }
};

// @desc    Get workouts with pagination
// @route   GET /api/workouts?page=1&limit=10
// @access  Private
const getWorkouts = async (req, res, next) => {
  try {
    const { workouts, pagination } = await workoutService.getWorkouts(req.query, req.user._id);

    return sendSuccess(res, 200, 'Workouts fetched successfully', workouts, { pagination });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get single workout by id
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await workoutService.getWorkoutById(req.params.id, req.user._id);

    return sendSuccess(res, 200, 'Workout fetched successfully', workout);
  } catch (error) {
    return next(error);
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res, next) => {
  try {
    const workout = await workoutService.updateWorkout(req.params.id, req.body, req.user._id);

    return sendSuccess(res, 200, 'Workout updated successfully', workout);
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res, next) => {
  try {
    const result = await workoutService.deleteWorkout(req.params.id, req.user._id);

    return sendSuccess(res, 200, 'Workout deleted successfully', result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
};
