const PersonalRecord = require('../models/PersonalRecord');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCompletedSets = (exercise) => {
  if (!Array.isArray(exercise.sets)) {
    return [];
  }

  return exercise.sets.filter((set) => set.completed);
};

const getExerciseRecords = (exercise) => {
  const completedSets = getCompletedSets(exercise);

  if (completedSets.length === 0) {
    return null;
  }

  const maxWeight = Math.max(...completedSets.map((set) => Number(set.weight) || 0));
  const maxReps = Math.max(...completedSets.map((set) => Number(set.actualReps) || 0));
  const totalVolume = completedSets.reduce(
    (sum, set) => sum + (Number(set.actualReps) || 0) * (Number(set.weight) || 0),
    0
  );

  return [
    { recordType: 'max_weight', value: maxWeight },
    { recordType: 'max_reps', value: maxReps },
    { recordType: 'max_volume', value: totalVolume },
  ];
};

const updatePersonalRecordsForSession = async (session) => {
  const newRecords = [];

  for (const exercise of session.exercises || []) {
    const exerciseName = String(exercise.name || '').trim();
    const recordValues = getExerciseRecords(exercise);

    if (!exerciseName || !recordValues) {
      continue;
    }

    for (const recordValue of recordValues) {
      const currentRecord = await PersonalRecord.findOne({
        user: session.user,
        recordType: recordValue.recordType,
        exerciseName: new RegExp(`^${escapeRegex(exerciseName)}$`, 'i'),
      });

      if (currentRecord && currentRecord.value >= recordValue.value) {
        continue;
      }

      const payload = {
        user: session.user,
        exerciseName,
        recordType: recordValue.recordType,
        value: recordValue.value,
        session: session._id,
        workoutName: session.workoutName,
        achievedAt: session.completedAt,
      };

      const savedRecord = currentRecord
        ? await PersonalRecord.findByIdAndUpdate(currentRecord._id, payload, { new: true })
        : await PersonalRecord.create(payload);

      newRecords.push(savedRecord);
    }
  }

  return newRecords;
};

module.exports = {
  updatePersonalRecordsForSession,
};
