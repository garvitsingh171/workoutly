import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../../services/api';
import {
  createDefaultExercise,
  normalizeWorkoutFormData,
} from '../../utils/workoutBuilderUtils';
import { validateWorkoutForm } from '../../utils/workoutFormValidation';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

const labelize = (value) => String(value || 'custom').replace('_', ' ');

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatRest = (seconds) => {
  const safeSeconds = Math.max(0, toPositiveInteger(seconds, 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

const moveArrayItem = (items, fromIndex, toIndex) => {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
};

const WorkoutBuilder = ({
  initialData,
  isSubmitting = false,
  submitLabel = 'Save Template',
  submittingLabel = 'Saving...',
  onSubmit,
  onCancel,
  coverSlot = null,
}) => {
  const [formData, setFormData] = useState(() => normalizeWorkoutFormData(initialData));
  const [formErrors, setFormErrors] = useState({});
  const [exerciseOptions, setExerciseOptions] = useState([]);

  useEffect(() => {
    const fetchExerciseOptions = async () => {
      try {
        const response = await api.get('/api/exercises');
        setExerciseOptions(response.data.data || []);
      } catch (requestError) {
        toast.error(getErrorMessage(requestError, 'Failed to load exercise suggestions.'));
      }
    };

    fetchExerciseOptions();
  }, []);

  const exerciseLookup = useMemo(() => {
    return exerciseOptions.reduce((lookup, exercise) => {
      lookup.set(exercise.name.toLowerCase(), exercise);
      return lookup;
    }, new Map());
  }, [exerciseOptions]);

  const suggestedExercises = useMemo(() => exerciseOptions.slice(0, 8), [exerciseOptions]);

  const builderStats = useMemo(() => {
    return formData.exercises.reduce(
      (totals, exercise) => {
        const sets = Math.max(0, toPositiveInteger(exercise.sets, 0));
        const reps = Math.max(0, toPositiveInteger(exercise.reps, 0));
        const restSeconds = Math.max(0, toPositiveInteger(exercise.restSeconds, 0));

        return {
          exercises: totals.exercises + 1,
          sets: totals.sets + sets,
          reps: totals.reps + sets * reps,
          restSeconds: totals.restSeconds + Math.max(0, sets - 1) * restSeconds,
        };
      },
      {
        exercises: 0,
        sets: 0,
        reps: 0,
        restSeconds: 0,
      }
    );
  }, [formData.exercises]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearExerciseError = (index, fieldName) => {
    setFormErrors((prev) => {
      const updatedExerciseErrors = [...(prev.exercises || [])];

      if (updatedExerciseErrors[index]) {
        updatedExerciseErrors[index] = {
          ...updatedExerciseErrors[index],
          [fieldName]: undefined,
        };
      }

      return {
        ...prev,
        exercises: updatedExerciseErrors,
      };
    });
  };

  const handleExerciseChange = (index, fieldName, value) => {
    clearExerciseError(index, fieldName);

    setFormData((prev) => {
      const updatedExercises = [...prev.exercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        [fieldName]: value,
      };

      return {
        ...prev,
        exercises: updatedExercises,
      };
    });
  };

  const handleAddExercise = (exercise = {}) => {
    setFormErrors((prev) => ({ ...prev, exercises: undefined }));
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, createDefaultExercise(exercise)],
    }));
  };

  const handleRemoveExercise = (index) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, currentIndex) => currentIndex !== index),
    }));

    setFormErrors((prev) => ({
      ...prev,
      exercises: (prev.exercises || []).filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleMoveExercise = (index, direction) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= formData.exercises.length) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      exercises: moveArrayItem(prev.exercises, index, targetIndex),
    }));

    setFormErrors((prev) => ({
      ...prev,
      exercises: Array.isArray(prev.exercises) && prev.exercises.length === formData.exercises.length
        ? moveArrayItem(prev.exercises, index, targetIndex)
        : prev.exercises,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormErrors({});

    const validation = validateWorkoutForm(formData);
    if (!validation.isValid) {
      const message = 'Fix the highlighted fields before saving this workout.';
      setFormErrors(validation.errors);
      toast.error(message);
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form className="workout-builder" onSubmit={handleSubmit}>
      <div className="workout-builder__main">
        <Card className="builder-card">
          <Card.Body>
            <div className="form-section-header">
              <div>
                <h3>Workout Details</h3>
                <p className="builder-section-copy">
                  Name the plan, set the target duration, and keep coaching notes close.
                </p>
              </div>
            </div>

            <Input
              label="Workout Name"
              name="name"
              type="text"
              placeholder="e.g. Push Day, Leg Strength, HIIT Burn"
              value={formData.name}
              onChange={handleFieldChange}
              error={formErrors.name}
              disabled={isSubmitting}
              required
            />

            <div className="form-grid form-grid--two">
              <Input
                label="Duration (minutes)"
                name="duration"
                type="number"
                min="1"
                max="600"
                value={formData.duration}
                onChange={handleFieldChange}
                error={formErrors.duration}
                disabled={isSubmitting}
                required
              />

              <div className="ui-input-group">
                <label htmlFor="difficulty" className="ui-label">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  className="ui-input"
                  value={formData.difficulty}
                  onChange={handleFieldChange}
                  disabled={isSubmitting}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="ui-input-group">
              <label htmlFor="notes" className="ui-label">Workout Notes</label>
              <textarea
                id="notes"
                name="notes"
                className="ui-input"
                rows="3"
                maxLength="500"
                placeholder="Warm-up, tempo, cooldown, or focus cues..."
                value={formData.notes}
                onChange={handleFieldChange}
                disabled={isSubmitting}
              />
            </div>
          </Card.Body>
        </Card>

        {coverSlot}

        <Card className="builder-card builder-card--exercises">
          <Card.Body>
            <div className="form-section-header">
              <div>
                <h3>Exercise Plan</h3>
                <p className="builder-section-copy">
                  Add movements, tune the targets, and order the session exactly how you train.
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleAddExercise()} disabled={isSubmitting}>
                Add Exercise
              </Button>
            </div>

            {formData.exercises.length === 0 ? (
              <div className="builder-empty-state">
                <div className="empty-state__mark" aria-hidden="true">W</div>
                <h4>No exercises added</h4>
                <p>Start with a library suggestion or add a custom movement to build this plan.</p>
                <Button type="button" variant="primary" onClick={() => handleAddExercise()} disabled={isSubmitting}>
                  Add First Exercise
                </Button>
              </div>
            ) : (
              <div className="builder-exercise-list">
                {formData.exercises.map((exercise, index) => {
                  const exerciseErrors = formErrors.exercises?.[index] || {};
                  const selectedExercise = exerciseLookup.get(exercise.name.trim().toLowerCase());

                  return (
                    <article key={exercise.clientId} className="builder-exercise-card">
                      <div className="builder-exercise-card__top">
                        <div className="builder-exercise-card__index" aria-hidden="true">{index + 1}</div>
                        <div>
                          <h4>{exercise.name.trim() || `Exercise ${index + 1}`}</h4>
                          <p>
                            {selectedExercise
                              ? `${labelize(selectedExercise.category)} - ${labelize(selectedExercise.equipment)}`
                              : 'Custom movement'}
                          </p>
                        </div>
                        <div className="builder-exercise-card__actions">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveExercise(index, -1)}
                            disabled={isSubmitting || index === 0}
                            aria-label={`Move exercise ${index + 1} up`}
                          >
                            Up
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveExercise(index, 1)}
                            disabled={isSubmitting || index === formData.exercises.length - 1}
                            aria-label={`Move exercise ${index + 1} down`}
                          >
                            Down
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveExercise(index)}
                            disabled={isSubmitting}
                            aria-label={`Remove exercise ${index + 1}`}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="builder-exercise-card__grid">
                        <Input
                          label="Exercise"
                          id={`exercise-name-${index}`}
                          type="text"
                          list="builder-exercise-options"
                          value={exercise.name}
                          onChange={(event) => handleExerciseChange(index, 'name', event.target.value)}
                          error={exerciseErrors.name}
                          placeholder="Bench Press"
                          disabled={isSubmitting}
                          groupClassName="builder-exercise-card__name"
                          required
                        />
                        <Input
                          label="Sets"
                          id={`exercise-sets-${index}`}
                          type="number"
                          min="1"
                          max="20"
                          value={exercise.sets}
                          onChange={(event) => handleExerciseChange(index, 'sets', event.target.value)}
                          error={exerciseErrors.sets}
                          disabled={isSubmitting}
                          required
                        />
                        <Input
                          label="Reps"
                          id={`exercise-reps-${index}`}
                          type="number"
                          min="1"
                          max="100"
                          value={exercise.reps}
                          onChange={(event) => handleExerciseChange(index, 'reps', event.target.value)}
                          error={exerciseErrors.reps}
                          disabled={isSubmitting}
                          required
                        />
                        <Input
                          label="Rest (sec)"
                          id={`exercise-rest-${index}`}
                          type="number"
                          min="0"
                          max="600"
                          step="5"
                          value={exercise.restSeconds}
                          onChange={(event) => handleExerciseChange(index, 'restSeconds', event.target.value)}
                          error={exerciseErrors.restSeconds}
                          disabled={isSubmitting}
                          required
                        />
                        <div className="ui-input-group builder-exercise-card__notes">
                          <label className="ui-label" htmlFor={`exercise-notes-${index}`}>Exercise Notes</label>
                          <textarea
                            id={`exercise-notes-${index}`}
                            className={`ui-input ${exerciseErrors.notes ? 'ui-input--error' : ''}`.trim()}
                            rows="2"
                            maxLength="240"
                            value={exercise.notes || ''}
                            onChange={(event) => handleExerciseChange(index, 'notes', event.target.value)}
                            placeholder="Tempo, cues, equipment setup..."
                            disabled={isSubmitting}
                            aria-invalid={exerciseErrors.notes ? 'true' : undefined}
                            aria-describedby={exerciseErrors.notes ? `exercise-notes-${index}-error` : undefined}
                          />
                          {exerciseErrors.notes && (
                            <span id={`exercise-notes-${index}-error`} className="ui-error-text" role="alert">
                              {exerciseErrors.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <datalist id="builder-exercise-options">
              {exerciseOptions.map((option) => (
                <option key={option._id || option.name} value={option.name}>
                  {option.category ? `${labelize(option.category)} - ${labelize(option.equipment)}` : option.name}
                </option>
              ))}
            </datalist>
          </Card.Body>
        </Card>
      </div>

      <aside className="workout-builder__rail" aria-label="Workout builder summary">
        <Card className="builder-summary-card">
          <Card.Body>
            <h3 className="form-card__title">Plan Summary</h3>
            <div className="builder-summary-grid">
              <div>
                <span>Exercises</span>
                <strong>{builderStats.exercises}</strong>
              </div>
              <div>
                <span>Total sets</span>
                <strong>{builderStats.sets}</strong>
              </div>
              <div>
                <span>Target reps</span>
                <strong>{builderStats.reps}</strong>
              </div>
              <div>
                <span>Rest time</span>
                <strong>{formatRest(builderStats.restSeconds)}</strong>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="builder-library-card">
          <Card.Body>
            <h3 className="form-card__title">Quick Add</h3>
            {suggestedExercises.length === 0 ? (
              <p className="builder-section-copy">Exercise suggestions will appear after the library loads.</p>
            ) : (
              <div className="builder-suggestion-list">
                {suggestedExercises.map((exercise) => (
                  <button
                    key={exercise._id || exercise.name}
                    type="button"
                    className="builder-suggestion"
                    onClick={() => handleAddExercise({ name: exercise.name })}
                    disabled={isSubmitting}
                  >
                    <span>{exercise.name}</span>
                    <small>{labelize(exercise.category)}</small>
                  </button>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </aside>

      <div className="form-actions workout-builder__actions">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default WorkoutBuilder;
