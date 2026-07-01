const mongoose = require('mongoose');

const personalRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exerciseName: {
      type: String,
      required: true,
      trim: true,
    },
    recordType: {
      type: String,
      enum: ['max_weight', 'max_reps', 'max_volume'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutSession',
    },
    workoutName: {
      type: String,
      trim: true,
      default: '',
    },
    achievedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

personalRecordSchema.index({ user: 1, exerciseName: 1, recordType: 1 }, { unique: true });

module.exports = mongoose.model('PersonalRecord', personalRecordSchema);
