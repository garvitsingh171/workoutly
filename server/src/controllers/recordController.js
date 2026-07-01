const PersonalRecord = require('../models/PersonalRecord');
const { sendSuccess } = require('../utils/apiResponse');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getRecords = async (req, res, next) => {
  try {
    const records = await PersonalRecord.find({ user: req.user._id }).sort({ achievedAt: -1 });

    return sendSuccess(res, 200, 'Personal records fetched successfully', records);
  } catch (error) {
    return next(error);
  }
};

const getRecordsByExercise = async (req, res, next) => {
  try {
    const exerciseName = String(req.params.exerciseName || '').trim();
    const records = await PersonalRecord.find({
      user: req.user._id,
      exerciseName: new RegExp(`^${escapeRegex(exerciseName)}$`, 'i'),
    }).sort({ achievedAt: -1 });

    return sendSuccess(res, 200, 'Exercise records fetched successfully', records);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRecords,
  getRecordsByExercise,
};
