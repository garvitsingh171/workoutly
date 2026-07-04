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

const parseDateOnly = (value, label) => {
  if (!value) return null;

  const dateText = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    throw new AppError(`${label} must be in YYYY-MM-DD format`, 400);
  }

  const date = new Date(`${dateText}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateText) {
    throw new AppError(`${label} is not a valid date`, 400);
  }

  return date;
};

const parseMonth = (value) => {
  if (!value) return null;

  const monthText = String(value).trim();
  if (!/^\d{4}-\d{2}$/.test(monthText)) {
    throw new AppError('month must be in YYYY-MM format', 400);
  }

  const date = new Date(`${monthText}-01T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 7) !== monthText) {
    throw new AppError('month is not valid', 400);
  }

  return date;
};

const buildSessionFilter = (query, userId, options = {}) => {
  const filter = { user: userId };
  const fromDate = parseDateOnly(query.from, 'from');
  const toDate = parseDateOnly(query.to, 'to');

  if (fromDate || toDate) {
    filter.completedAt = {};

    if (fromDate) {
      filter.completedAt.$gte = fromDate;
    }

    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      filter.completedAt.$lt = endDate;
    }
  }

  if (fromDate && toDate && fromDate > toDate) {
    throw new AppError('from date must be before or equal to to date', 400);
  }

  if (options.includeWorkoutName && query.workoutName) {
    const workoutName = String(query.workoutName).trim();
    if (workoutName) {
      filter.workoutName = new RegExp(escapeRegex(workoutName), 'i');
    }
  }

  return filter;
};

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';

  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

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

    if (normalized.totalCompletedSets === 0) {
      throw new AppError('Complete at least one set before saving a session', 400);
    }

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
    const filter = buildSessionFilter(req.query, req.user._id, { includeWorkoutName: true });

    const [sessions, total] = await Promise.all([
      WorkoutSession.find(filter)
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit),
      WorkoutSession.countDocuments(filter),
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

const getSessionCalendar = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    const monthStart = parseMonth(req.query.month);

    if (monthStart) {
      const nextMonth = new Date(monthStart);
      nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);

      filter.completedAt = {
        $gte: monthStart,
        $lt: nextMonth,
      };
    }

    const sessions = await WorkoutSession.find(filter).sort({ completedAt: 1 });
    const groupedByDate = sessions.reduce((groups, session) => {
      const date = getDateKey(session.completedAt);

      if (!groups[date]) {
        groups[date] = {
          date,
          sessionCount: 0,
          totalVolume: 0,
          totalCompletedSets: 0,
        };
      }

      groups[date].sessionCount += 1;
      groups[date].totalVolume += session.totalVolume || 0;
      groups[date].totalCompletedSets += session.totalCompletedSets || 0;

      return groups;
    }, {});

    return sendSuccess(
      res,
      200,
      'Workout session calendar fetched successfully',
      Object.values(groupedByDate)
    );
  } catch (error) {
    return next(error);
  }
};

const exportSessionsCsv = async (req, res, next) => {
  try {
    const filter = buildSessionFilter(req.query, req.user._id, { includeWorkoutName: true });
    const sessions = await WorkoutSession.find(filter).sort({ completedAt: -1 });
    const header = [
      'sessionId',
      'workoutName',
      'completedAt',
      'durationMinutes',
      'exerciseName',
      'setNumber',
      'targetReps',
      'actualReps',
      'weight',
      'completed',
      'totalVolume',
    ];

    const rows = [header];

    sessions.forEach((session) => {
      (session.exercises || []).forEach((exercise) => {
        (exercise.sets || []).forEach((set) => {
          rows.push([
            session._id,
            session.workoutName,
            session.completedAt ? session.completedAt.toISOString() : '',
            session.durationMinutes,
            exercise.name,
            set.setNumber,
            set.targetReps,
            set.actualReps,
            set.weight,
            set.completed,
            session.totalVolume,
          ]);
        });
      });
    });

    const csv = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="workoutly-sessions.csv"');
    return res.status(200).send(`${csv}\n`);
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
  getSessionCalendar,
  exportSessionsCsv,
  getRecentSessions,
  getSessionSummary,
  getExerciseProgress,
};
