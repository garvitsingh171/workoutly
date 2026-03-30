const Workout = require('../models/Workout');

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  try {
    const { name, exercises, duration, difficulty, notes } = req.body;

    if (!name || !Array.isArray(exercises) || exercises.length === 0 || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, duration and at least one exercise',
      });
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
      return res.status(400).json({
        success: false,
        message: 'Every exercise must include valid name, sets, and reps',
      });
    }

    const workout = await Workout.create({
      name: String(name).trim(),
      exercises: cleanedExercises,
      duration: Number.parseInt(duration, 10),
      difficulty,
      notes,
      author: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: workout,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating workout',
      error: error.message,
    });
  }
};

// @desc    Get workouts with pagination
// @route   GET /api/workouts?page=1&limit=10
// @access  Private
const getWorkouts = async (req, res) => {
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
    return res.status(500).json({
      success: false,
      message: 'Error fetching workouts',
      error: error.message,
    });
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
};
