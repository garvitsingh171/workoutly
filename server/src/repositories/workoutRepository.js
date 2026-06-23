const Workout = require('../models/Workout');

const createWorkout = (workoutData) => {
  return Workout.create(workoutData);
};

const findWorkoutsByAuthorWithPagination = (authorId, skip, limit) => {
  return Workout.find({ author: authorId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name email');
};

const countWorkoutsByAuthor = (authorId) => {
  return Workout.countDocuments({ author: authorId });
};

const findWorkoutById = (workoutId, shouldPopulateAuthor = false) => {
  const query = Workout.findById(workoutId);

  if (shouldPopulateAuthor) {
    query.populate('author', 'name email');
  }

  return query;
};

const saveWorkout = (workout) => {
  return workout.save();
};

const deleteWorkout = (workout) => {
  return workout.deleteOne();
};

module.exports = {
  createWorkout,
  findWorkoutsByAuthorWithPagination,
  countWorkoutsByAuthor,
  findWorkoutById,
  saveWorkout,
  deleteWorkout,
};
