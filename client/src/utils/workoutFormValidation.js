const isIntegerInRange = (value, min, max) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue >= min && numberValue <= max;
};

export const validateWorkoutForm = (formData) => {
  const errors = {};
  const exerciseErrors = [];

  if (!formData.name.trim()) {
    errors.name = 'Workout name is required.';
  } else if (formData.name.trim().length > 100) {
    errors.name = 'Workout name cannot exceed 100 characters.';
  }

  if (!isIntegerInRange(formData.duration, 1, 600)) {
    errors.duration = 'Duration must be between 1 and 600 minutes.';
  }

  formData.exercises.forEach((exercise, index) => {
    const currentErrors = {};

    if (!exercise.name.trim()) {
      currentErrors.name = 'Exercise name is required.';
    }

    if (!isIntegerInRange(exercise.sets, 1, 20)) {
      currentErrors.sets = 'Sets must be between 1 and 20.';
    }

    if (!isIntegerInRange(exercise.reps, 1, 100)) {
      currentErrors.reps = 'Reps must be between 1 and 100.';
    }

    if (Object.keys(currentErrors).length > 0) {
      exerciseErrors[index] = currentErrors;
    }
  });

  if (exerciseErrors.length > 0) {
    errors.exercises = exerciseErrors;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
