const Exercise = require('../models/Exercise');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const defaultExercises = require('../data/defaultExercises');

const VALID_CATEGORIES = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full_body', 'other'];
const VALID_EQUIPMENT = ['barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'kettlebell', 'other'];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const exerciseMatchesFilters = (exercise, filters) => {
  const nameMatches = !filters.search || exercise.name.toLowerCase().includes(filters.search.toLowerCase());
  const categoryMatches = !filters.category || exercise.category === filters.category;
  const equipmentMatches = !filters.equipment || exercise.equipment === filters.equipment;

  return nameMatches && categoryMatches && equipmentMatches;
};

const mergeExercisesByName = (databaseExercises, userId) => {
  const exerciseMap = new Map();

  defaultExercises.forEach((exercise) => {
    exerciseMap.set(exercise.name.toLowerCase(), {
      ...exercise,
      instructions: exercise.instructions || '',
      isDefault: true,
      createdBy: null,
    });
  });

  databaseExercises.forEach((exercise) => {
    const plainExercise = exercise.toObject ? exercise.toObject() : exercise;
    const canSeeExercise = plainExercise.isDefault || String(plainExercise.createdBy || '') === String(userId);

    if (canSeeExercise) {
      exerciseMap.set(plainExercise.name.toLowerCase(), plainExercise);
    }
  });

  return Array.from(exerciseMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const getExercises = async (req, res, next) => {
  try {
    const filters = {
      search: String(req.query.search || '').trim(),
      category: String(req.query.category || '').trim(),
      equipment: String(req.query.equipment || '').trim(),
    };

    const query = {
      $or: [{ isDefault: true }, { createdBy: req.user._id }],
    };

    if (filters.search) {
      query.name = new RegExp(escapeRegex(filters.search), 'i');
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.equipment) {
      query.equipment = filters.equipment;
    }

    const databaseExercises = await Exercise.find(query).sort({ name: 1 });
    const exercises = mergeExercisesByName(databaseExercises, req.user._id).filter((exercise) =>
      exerciseMatchesFilters(exercise, filters)
    );

    return sendSuccess(res, 200, 'Exercises fetched successfully', exercises);
  } catch (error) {
    return next(error);
  }
};

const createExercise = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const category = VALID_CATEGORIES.includes(req.body.category) ? req.body.category : 'other';
    const equipment = VALID_EQUIPMENT.includes(req.body.equipment) ? req.body.equipment : 'other';
    const instructions = typeof req.body.instructions === 'string' ? req.body.instructions.trim() : '';

    if (!name) {
      throw new AppError('Exercise name is required', 400);
    }

    const existingExercise = await Exercise.findOne({
      name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
      $or: [{ isDefault: true }, { createdBy: req.user._id }],
    });

    const existingDefault = defaultExercises.find(
      (exercise) => exercise.name.toLowerCase() === name.toLowerCase()
    );

    if (existingExercise || existingDefault) {
      throw new AppError('Exercise already exists', 400);
    }

    const exercise = await Exercise.create({
      name,
      category,
      equipment,
      instructions,
      isDefault: false,
      createdBy: req.user._id,
    });

    return sendSuccess(res, 201, 'Exercise created successfully', exercise);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getExercises,
  createExercise,
};
