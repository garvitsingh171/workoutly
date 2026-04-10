const Workout = require('../models/Workout');
const AppError = require('../utils/AppError');

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const validateAndBuildWorkoutPayload = ({ name, exercises, duration, difficulty, notes, coverImage }) => {
  if (!name || !Array.isArray(exercises) || exercises.length === 0 || !duration) {
    return {
      error: 'Please provide name, duration and at least one exercise',
    };
  }

  const cleanedExercises = exercises.map((exercise) => ({
    name: String(exercise.name || '').trim(),
    sets: Number.parseInt(exercise.sets, 10),
    reps: Number.parseInt(exercise.reps, 10),
  }));

  const hasInvalidExercise = cleanedExercises.some(
    (exercise) =>
      !exercise.name ||
      Number.isNaN(exercise.sets) ||
      exercise.sets <= 0 ||
      Number.isNaN(exercise.reps) ||
      exercise.reps <= 0
  );

  if (hasInvalidExercise) {
    return {
      error: 'Every exercise must include valid name, sets, and reps',
    };
  }

  const parsedDuration = Number.parseInt(duration, 10);

  if (Number.isNaN(parsedDuration) || parsedDuration <= 0) {
    return {
      error: 'Duration must be a valid positive number',
    };
  }

  const normalizedCoverImage =
    typeof coverImage === 'string' && coverImage.trim().length > 0 ? coverImage.trim() : null;

  return {
    data: {
      name: String(name).trim(),
      exercises: cleanedExercises,
      duration: parsedDuration,
      difficulty,
      notes,
      coverImage: normalizedCoverImage,
    },
  };
};

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res, next) => {
  try {
    const { name, exercises, duration, difficulty, notes, coverImage } = req.body;

    const payloadResult = validateAndBuildWorkoutPayload({
      name,
      exercises,
      duration,
      difficulty,
      notes,
      coverImage,
    });

    if (payloadResult.error) {
      return next(new AppError(payloadResult.error, 400));
    }

    const workout = await Workout.create({
      ...payloadResult.data,
      author: req.user._id,
    });

    if (req.io) {
      req.io.emit('newWorkout', {
        message: `New workout created by ${req.user.name}!`,
        workout: {
          _id: workout._id,
          name: workout.name,
          duration: workout.duration,
          difficulty: workout.difficulty,
          createdBy: req.user.name,
          createdAt: workout.createdAt,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: workout,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get workouts with pagination
// @route   GET /api/workouts?page=1&limit=10
// @access  Private
const getWorkouts = async (req, res, next) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const requestedLimit = parsePositiveInteger(req.query.limit, 10);
    const limit = Math.min(requestedLimit, 50);
    const skip = (page - 1) * limit;

    const filter = { author: req.user._id };

    const [workouts, total] = await Promise.all([
      Workout.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email'),
      Workout.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: workouts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Get single workout by id
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id).populate('author', 'name email');

    if (!workout) {
      return next(new AppError('Workout not found', 404));
    }

    if (workout.author._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to view this workout', 403));
    }

    return res.status(200).json({
      success: true,
      data: workout,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return next(new AppError('Workout not found', 404));
    }

    if (workout.author.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to update this workout', 403));
    }

    const { name, exercises, duration, difficulty, notes, coverImage } = req.body;
    const payloadResult = validateAndBuildWorkoutPayload({
      name,
      exercises,
      duration,
      difficulty,
      notes,
      coverImage,
    });

    if (payloadResult.error) {
      return next(new AppError(payloadResult.error, 400));
    }

    workout.name = payloadResult.data.name;
    workout.exercises = payloadResult.data.exercises;
    workout.duration = payloadResult.data.duration;
    workout.difficulty = payloadResult.data.difficulty;
    workout.notes = payloadResult.data.notes;
    workout.coverImage = payloadResult.data.coverImage;

    const updatedWorkout = await workout.save();

    return res.status(200).json({
      success: true,
      message: 'Workout updated successfully',
      data: updatedWorkout,
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return next(new AppError('Workout not found', 404));
    }

    if (workout.author.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to delete this workout', 403));
    }

    await workout.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Workout deleted successfully',
      data: { id: req.params.id },
    });
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
