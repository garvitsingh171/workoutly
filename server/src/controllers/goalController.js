const Goal = require('../models/Goal');
const WorkoutSession = require('../models/WorkoutSession');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

const DEFAULT_WEEKLY_TARGET = 3;

const getDateKey = (date) => new Date(date).toISOString().slice(0, 10);

const getStartOfWeek = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

const validateWeeklyTarget = (value) => {
  const target = Number(value);

  if (!Number.isInteger(target) || target < 1 || target > 14) {
    throw new AppError('weeklyWorkoutTarget must be an integer between 1 and 14', 400);
  }

  return target;
};

const getActiveGoal = async (userId) => {
  return Goal.findOne({ user: userId, isActive: true }).sort({ createdAt: -1 });
};

const buildDefaultGoal = (userId) => ({
  user: userId,
  weeklyWorkoutTarget: DEFAULT_WEEKLY_TARGET,
  isActive: true,
});

const calculateCurrentStreakDays = (sessions) => {
  const sessionDays = new Set(sessions.map((session) => getDateKey(session.completedAt)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(today);
  if (!sessionDays.has(getDateKey(currentDate))) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  let streak = 0;
  while (sessionDays.has(getDateKey(currentDate))) {
    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

const calculateLongestStreakDays = (sessions) => {
  const sortedDays = [...new Set(sessions.map((session) => getDateKey(session.completedAt)))].sort();
  let longest = 0;
  let current = 0;
  let previousDate = null;

  sortedDays.forEach((day) => {
    const currentDate = new Date(`${day}T00:00:00.000Z`);

    if (previousDate) {
      const expectedNextDate = new Date(previousDate);
      expectedNextDate.setUTCDate(expectedNextDate.getUTCDate() + 1);
      current = getDateKey(expectedNextDate) === day ? current + 1 : 1;
    } else {
      current = 1;
    }

    longest = Math.max(longest, current);
    previousDate = currentDate;
  });

  return longest;
};

const getCurrentGoal = async (req, res, next) => {
  try {
    const goal = await getActiveGoal(req.user._id);

    return sendSuccess(
      res,
      200,
      'Current goal fetched successfully',
      goal || buildDefaultGoal(req.user._id)
    );
  } catch (error) {
    return next(error);
  }
};

const updateCurrentGoal = async (req, res, next) => {
  try {
    const weeklyWorkoutTarget = validateWeeklyTarget(req.body.weeklyWorkoutTarget);
    const goal = await Goal.findOneAndUpdate(
      { user: req.user._id, isActive: true },
      { weeklyWorkoutTarget, isActive: true },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return sendSuccess(res, 200, 'Current goal updated successfully', goal);
  } catch (error) {
    return next(error);
  }
};

const getGoalSummary = async (req, res, next) => {
  try {
    const goal = await getActiveGoal(req.user._id);
    const weeklyWorkoutTarget = goal?.weeklyWorkoutTarget || DEFAULT_WEEKLY_TARGET;
    const startOfWeek = getStartOfWeek();
    const sessions = await WorkoutSession.find({ user: req.user._id }).sort({ completedAt: 1 });
    const sessionsThisWeek = sessions.filter((session) => session.completedAt >= startOfWeek).length;
    const remainingThisWeek = Math.max(0, weeklyWorkoutTarget - sessionsThisWeek);
    const weeklyProgressPercent = Math.min(
      100,
      Math.round((sessionsThisWeek / weeklyWorkoutTarget) * 100)
    );

    return sendSuccess(res, 200, 'Goal summary fetched successfully', {
      weeklyWorkoutTarget,
      sessionsThisWeek,
      remainingThisWeek,
      weeklyProgressPercent,
      currentStreakDays: calculateCurrentStreakDays(sessions),
      longestStreakDays: calculateLongestStreakDays(sessions),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCurrentGoal,
  updateCurrentGoal,
  getGoalSummary,
};
