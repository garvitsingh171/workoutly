const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    sets: {
      type: Number,
      min: [1, 'Sets must be at least 1'],
      max: [20, 'Sets cannot exceed 20'],
      required: [true, 'Sets are required'],
    },
    reps: {
      type: Number,
      min: [1, 'Reps must be at least 1'],
      max: [100, 'Reps cannot exceed 100'],
      required: [true, 'Reps are required'],
    },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workout name is required'],
      trim: true,
      maxlength: [100, 'Workout name cannot exceed 100 characters'],
    },
    exercises: {
      type: [exerciseSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one exercise is required',
      },
      default: [],
    },
    duration: {
      type: Number,
      min: [1, 'Duration must be at least 1 minute'],
      max: [600, 'Duration cannot exceed 600 minutes'],
      required: [true, 'Duration is required'],
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    coverImage: {
      type: String,
      trim: true,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Workout', workoutSchema);
