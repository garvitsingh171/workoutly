const Workout = require('../models/Workout');

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const validateAndBuildWorkoutPayload = ({ name, exercises, duration, difficulty, notes }) => {
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

  return {
    data: {
      name: String(name).trim(),
      exercises: cleanedExercises,
      duration: parsedDuration,
      difficulty,
      notes,
    },
  };
};

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  try {
    const { name, exercises, duration, difficulty, notes } = req.body;

    const payloadResult = validateAndBuildWorkoutPayload({
      name,
      exercises,
      duration,
      difficulty,
      notes,
    });

    if (payloadResult.error) {
      return res.status(400).json({
        success: false,
        message: payloadResult.error,
      });
    }

    const workout = await Workout.create({
      ...payloadResult.data,
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

// @desc    Get single workout by id
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id).populate('author', 'name email');

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    if (workout.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this workout',
      });
    }

    return res.status(200).json({
      success: true,
      data: workout,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching workout',
      error: error.message,
    });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    if (workout.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this workout',
      });
    }

    const { name, exercises, duration, difficulty, notes } = req.body;
    const payloadResult = validateAndBuildWorkoutPayload({
      name,
      exercises,
      duration,
      difficulty,
      notes,
    });

    if (payloadResult.error) {
      return res.status(400).json({
        success: false,
        message: payloadResult.error,
      });
    }

    workout.name = payloadResult.data.name;
    workout.exercises = payloadResult.data.exercises;
    workout.duration = payloadResult.data.duration;
    workout.difficulty = payloadResult.data.difficulty;
    workout.notes = payloadResult.data.notes;

    const updatedWorkout = await workout.save();

    return res.status(200).json({
      success: true,
      message: 'Workout updated successfully',
      data: updatedWorkout,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating workout',
      error: error.message,
    });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    if (workout.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this workout',
      });
    }

    await workout.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Workout deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting workout',
      error: error.message,
    });
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
};
