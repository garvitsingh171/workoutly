const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full_body', 'other'],
      default: 'other',
    },
    equipment: {
      type: String,
      enum: ['barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'kettlebell', 'other'],
      default: 'other',
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

exerciseSchema.index(
  { name: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);
exerciseSchema.index(
  { name: 1, createdBy: 1 },
  { unique: true, partialFilterExpression: { isDefault: false } }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
