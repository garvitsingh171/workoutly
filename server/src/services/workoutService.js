const AppError = require('../utils/AppError');
const workoutRepository = require('../repositories/workoutRepository');

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const buildWorkoutPayload = (body) => {
  const normalizedCoverImage =
    typeof body.coverImage === 'string' && body.coverImage.trim().length > 0
      ? body.coverImage.trim()
      : null;

  const payload = {
    name: body.name.trim(),
    exercises: body.exercises.map((exercise) => ({
      name: exercise.name.trim(),
      sets: exercise.sets,
      reps: exercise.reps,
    })),
    duration: body.duration,
    notes: typeof body.notes === 'string' ? body.notes.trim() : '',
    coverImage: normalizedCoverImage,
  };

  if (body.difficulty) {
    payload.difficulty = body.difficulty;
  }

  return payload;
};

const getWorkoutAuthorId = (workout) => {
  return String(workout.author?._id || workout.author);
};

const ensureWorkoutOwner = (workout, userId, action) => {
  if (getWorkoutAuthorId(workout) !== String(userId)) {
    throw new AppError(`Not authorized to ${action} this workout`, 403);
  }
};

const createWorkout = async (body, userId) => {
  const payload = buildWorkoutPayload(body);

  return workoutRepository.createWorkout({
    ...payload,
    author: userId,
  });
};

const getWorkouts = async (query, userId) => {
  const page = parsePositiveInteger(query.page, 1);
  const requestedLimit = parsePositiveInteger(query.limit, 10);
  const limit = Math.min(requestedLimit, 50);
  const skip = (page - 1) * limit;

  const [workouts, total] = await Promise.all([
    workoutRepository.findWorkoutsByAuthorWithPagination(userId, skip, limit),
    workoutRepository.countWorkoutsByAuthor(userId),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    workouts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

const getWorkoutById = async (workoutId, userId) => {
  const workout = await workoutRepository.findWorkoutById(workoutId, true);

  if (!workout) {
    throw new AppError('Workout not found', 404);
  }

  ensureWorkoutOwner(workout, userId, 'view');
  return workout;
};

const updateWorkout = async (workoutId, body, userId) => {
  const workout = await workoutRepository.findWorkoutById(workoutId);

  if (!workout) {
    throw new AppError('Workout not found', 404);
  }

  ensureWorkoutOwner(workout, userId, 'update');

  const payload = buildWorkoutPayload(body);
  workout.name = payload.name;
  workout.exercises = payload.exercises;
  workout.duration = payload.duration;
  workout.notes = payload.notes;
  workout.coverImage = payload.coverImage;

  if (payload.difficulty) {
    workout.difficulty = payload.difficulty;
  }

  return workoutRepository.saveWorkout(workout);
};

const deleteWorkout = async (workoutId, userId) => {
  const workout = await workoutRepository.findWorkoutById(workoutId);

  if (!workout) {
    throw new AppError('Workout not found', 404);
  }

  ensureWorkoutOwner(workout, userId, 'delete');
  await workoutRepository.deleteWorkout(workout);

  return { id: workoutId };
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
};
