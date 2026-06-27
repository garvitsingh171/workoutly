const mongoose = require('mongoose');

const sessionSetSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    targetReps: {
      type: Number,
      default: 0,
    },
    actualReps: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const sessionExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sets: {
      type: [sessionSetSchema],
      default: [],
    },
  },
  { _id: false }
);

const workoutSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      required: true,
    },
    workoutName: {
      type: String,
      required: true,
      trim: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    exercises: {
      type: [sessionExerciseSchema],
      default: [],
    },
    totalCompletedSets: {
      type: Number,
      default: 0,
    },
    totalVolume: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
