const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const WorkoutSession = require('../models/WorkoutSession');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');
const { updatePersonalRecordsForSession } = require('../services/recordService');

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const getWorkoutAuthorId = (workout) => String(workout.author?._id || workout.author);

const toSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeExercises = (exercises = []) => {
  let totalCompletedSets = 0;
  let totalVolume = 0;

  const normalizedExercises = exercises.map((exercise) => {
    const sets = Array.isArray(exercise.sets) ? exercise.sets : [];

    return {
      name: String(exercise.name || '').trim(),
      sets: sets.map((set, index) => {
        const actualReps = Math.max(0, toSafeNumber(set.actualReps));
        const weight = Math.max(0, toSafeNumber(set.weight));
        const completed = Boolean(set.completed);

        if (completed) {
          totalCompletedSets += 1;
          totalVolume += actualReps * weight;
        }

        return {
          setNumber: toSafeNumber(set.setNumber, index + 1),
          targetReps: Math.max(0, toSafeNumber(set.targetReps)),
          actualReps,
          weight,
          completed,
        };
      }),
    };
  });

  return {
    exercises: normalizedExercises,
    totalCompletedSets,
    totalVolume,
  };
};

const getStartOfWeek = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

const getDateKey = (date) => new Date(date).toISOString().slice(0, 10);

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const calculateCurrentStreakDays = (sessions) => {
  const sessionDays = new Set(sessions.map((session) => getDateKey(session.completedAt)));
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  let streak = 0;

  while (sessionDays.has(getDateKey(currentDate))) {
    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

const createSession = async (req, res, next) => {
  try {
    const { workout: workoutId, startedAt, completedAt, durationMinutes, notes } = req.body;

    if (!workoutId || !mongoose.Types.ObjectId.isValid(workoutId)) {
      throw new AppError('Valid workout id is required', 400);
    }

    const workout = await Workout.findById(workoutId);

    if (!workout) {
      throw new AppError('Workout not found', 404);
    }

    if (getWorkoutAuthorId(workout) !== String(req.user._id)) {
      throw new AppError('Not authorized to save a session for this workout', 403);
    }

    if (!startedAt || !completedAt) {
      throw new AppError('Session start and completion times are required', 400);
    }

    const normalized = normalizeExercises(req.body.exercises);

    const session = await WorkoutSession.create({
      user: req.user._id,
      workout: workout._id,
      workoutName: workout.name,
      startedAt,
      completedAt,
      durationMinutes: Math.max(0, toSafeNumber(durationMinutes)),
      exercises: normalized.exercises,
      totalCompletedSets: normalized.totalCompletedSets,
      totalVolume: normalized.totalVolume,
      notes: typeof notes === 'string' ? notes.trim() : '',
    });

    const newRecords = await updatePersonalRecordsForSession(session);

    return sendSuccess(res, 201, 'Workout session saved successfully', session, { newRecords });
  } catch (error) {
    return next(error);
  }
};

const getExerciseProgress = async (req, res, next) => {
  try {
    const exerciseName = String(req.query.exerciseName || '').trim();

    if (!exerciseName) {
      throw new AppError('exerciseName is required', 400);
    }

    const exerciseNameRegex = new RegExp(`^${escapeRegex(exerciseName)}$`, 'i');
    const sessions = await WorkoutSession.find({
      user: req.user._id,
      'exercises.name': exerciseNameRegex,
    }).sort({ completedAt: 1 });

    const progress = sessions.map((session) => {
      const matchingExercises = (session.exercises || []).filter((exercise) =>
        exerciseNameRegex.test(exercise.name)
      );

      const completedSets = matchingExercises.flatMap((exercise) =>
        (exercise.sets || []).filter((set) => set.completed)
      );

      const bestWeight = completedSets.reduce(
        (best, set) => Math.max(best, Number(set.weight) || 0),
        0
      );
      const bestReps = completedSets.reduce(
        (best, set) => Math.max(best, Number(set.actualReps) || 0),
        0
      );
      const totalVolume = completedSets.reduce(
        (sum, set) => sum + (Number(set.actualReps) || 0) * (Number(set.weight) || 0),
        0
      );

      return {
        sessionId: session._id,
        workoutName: session.workoutName,
        completedAt: session.completedAt,
        bestWeight,
        bestReps,
        totalVolume,
        completedSets: completedSets.length,
      };
    });

    return sendSuccess(res, 200, 'Exercise progress fetched successfully', progress);
  } catch (error) {
    return next(error);
  }
};

const getSessions = async (req, res, next) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const requestedLimit = parsePositiveInteger(req.query.limit, 10);
    const limit = Math.min(requestedLimit, 50);
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      WorkoutSession.find({ user: req.user._id })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit),
      WorkoutSession.countDocuments({ user: req.user._id }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, 200, 'Workout sessions fetched successfully', sessions, {
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

const getRecentSessions = async (req, res, next) => {
  try {
    const sessions = await WorkoutSession.find({ user: req.user._id })
      .sort({ completedAt: -1 })
      .limit(5);

    return sendSuccess(res, 200, 'Recent workout sessions fetched successfully', sessions);
  } catch (error) {
    return next(error);
  }
};

const getSessionSummary = async (req, res, next) => {
  try {
    const sessions = await WorkoutSession.find({ user: req.user._id }).sort({ completedAt: -1 });
    const startOfWeek = getStartOfWeek();

    const summary = sessions.reduce(
      (totals, session) => ({
        totalSessions: totals.totalSessions + 1,
        totalCompletedSets: totals.totalCompletedSets + (session.totalCompletedSets || 0),
        totalVolume: totals.totalVolume + (session.totalVolume || 0),
        sessionsThisWeek:
          session.completedAt >= startOfWeek ? totals.sessionsThisWeek + 1 : totals.sessionsThisWeek,
      }),
      {
        totalSessions: 0,
        totalCompletedSets: 0,
        totalVolume: 0,
        sessionsThisWeek: 0,
      }
    );

    return sendSuccess(res, 200, 'Workout session summary fetched successfully', {
      ...summary,
      latestSession: sessions[0] || null,
      currentStreakDays: calculateCurrentStreakDays(sessions),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createSession,
  getSessions,
  getRecentSessions,
  getSessionSummary,
  getExerciseProgress,
};
