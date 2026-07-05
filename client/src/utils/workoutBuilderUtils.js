const createExerciseKey = () => `exercise-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const createDefaultExercise = (overrides = {}) => ({
  clientId: createExerciseKey(),
  name: '',
  sets: 3,
  reps: 10,
  restSeconds: 90,
  notes: '',
  ...overrides,
});

export const createDefaultWorkoutData = () => ({
  name: '',
  duration: 45,
  difficulty: 'beginner',
  notes: '',
  exercises: [createDefaultExercise()],
});

export const normalizeWorkoutFormData = (workout = {}) => ({
  name: workout.name || '',
  duration: workout.duration || 45,
  difficulty: workout.difficulty || 'beginner',
  notes: workout.notes || '',
  exercises:
    Array.isArray(workout.exercises) && workout.exercises.length > 0
      ? workout.exercises.map((exercise) =>
          createDefaultExercise({
            name: exercise.name || '',
            sets: exercise.sets || 1,
            reps: exercise.reps || 1,
            restSeconds: exercise.restSeconds ?? 90,
            notes: exercise.notes || '',
          })
        )
      : [createDefaultExercise()],
});

export const serializeWorkoutForm = (formData, extraFields = {}) => ({
  ...extraFields,
  name: formData.name.trim(),
  duration: Number.parseInt(formData.duration, 10),
  difficulty: formData.difficulty,
  notes: formData.notes.trim(),
  exercises: formData.exercises.map((exercise) => ({
    name: exercise.name.trim(),
    sets: Number.parseInt(exercise.sets, 10),
    reps: Number.parseInt(exercise.reps, 10),
    restSeconds: Number.parseInt(exercise.restSeconds, 10),
    notes: (exercise.notes || '').trim(),
  })),
});
