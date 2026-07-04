import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { validateWorkoutForm } from '../utils/workoutFormValidation';

const createDefaultExercise = () => ({
  name: '',
  sets: 3,
  reps: 10,
});

const EditWorkout = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    duration: 45,
    difficulty: 'beginner',
    notes: '',
    exercises: [createDefaultExercise()],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => {
    const fetchWorkout = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await api.get(`/api/workouts/${id}`);
        const workout = response.data.data;

        setFormData({
          name: workout.name || '',
          duration: workout.duration || 45,
          difficulty: workout.difficulty || 'beginner',
          notes: workout.notes || '',
          exercises:
            Array.isArray(workout.exercises) && workout.exercises.length > 0
              ? workout.exercises.map((exercise) => ({
                  name: exercise.name || '',
                  sets: exercise.sets || 1,
                  reps: exercise.reps || 1,
                }))
              : [createDefaultExercise()],
        });
      } catch (requestError) {
        const message = getErrorMessage(requestError, 'Failed to load workout details.');
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setError('');
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExerciseChange = (index, key, value) => {
    setError('');
    setFormErrors((prev) => {
      const updatedExerciseErrors = [...(prev.exercises || [])];
      if (updatedExerciseErrors[index]) {
        updatedExerciseErrors[index] = {
          ...updatedExerciseErrors[index],
          [key]: undefined,
        };
      }

      return {
        ...prev,
        exercises: updatedExerciseErrors,
      };
    });

    setFormData((prev) => {
      const updatedExercises = [...prev.exercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        [key]: value,
      };
      return {
        ...prev,
        exercises: updatedExercises,
      };
    });
  };

  const handleAddExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, createDefaultExercise()],
    }));
  };

  const handleRemoveExercise = (index) => {
    setFormData((prev) => {
      if (prev.exercises.length === 1) {
        return prev;
      }

      return {
        ...prev,
        exercises: prev.exercises.filter((_, currentIndex) => currentIndex !== index),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFormErrors({});

    const validation = validateWorkoutForm(formData);
    if (!validation.isValid) {
      const message = 'Fix the highlighted fields before updating this workout.';
      setFormErrors(validation.errors);
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      name: formData.name.trim(),
      notes: formData.notes.trim(),
      duration: Number.parseInt(formData.duration, 10),
      exercises: formData.exercises.map((exercise) => ({
        name: exercise.name.trim(),
        sets: Number.parseInt(exercise.sets, 10),
        reps: Number.parseInt(exercise.reps, 10),
      })),
    };

    try {
      const response = await api.put(`/api/workouts/${id}`, payload);
      if (response.data.success) {
        toast.success('Workout updated successfully!');
        navigate('/dashboard');
      }
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Failed to update workout. Please try again.');
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-state">
        <div className="loading-spinner" aria-hidden="true"></div>
        <p className="loading-spinner__text">Loading workout...</p>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="page-state">
        <div className="alert alert-error">{error}</div>
        <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <section className="page page-form">
      <div className="form-page-wrap">
        <header className="page-heading">
          <Badge color="primary" className="page-heading__eyebrow">Routine Editor</Badge>
          <h1 className="page-heading__title">Edit Workout</h1>
          <p className="page-heading__text">Update your routine details, exercise targets, and notes without changing how sessions work.</p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="workout-form" onSubmit={handleSubmit}>
          <Card>
            <Card.Body>
              <h3 className="form-card__title">Workout Details</h3>

              <Input
                label="Workout Name"
                id="workoutName"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleFieldChange}
                error={formErrors.name}
                required
              />

              <div className="form-grid form-grid--two">
                <Input
                  label="Duration (minutes)"
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  max="600"
                  value={formData.duration}
                  onChange={handleFieldChange}
                  error={formErrors.duration}
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
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="ui-input-group">
                <label htmlFor="notes" className="ui-label">Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="ui-input"
                  rows="4"
                  maxLength="500"
                  value={formData.notes}
                  onChange={handleFieldChange}
                />
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="form-section-header">
                <h3>Exercises</h3>
                <Button type="button" variant="ghost" size="sm" onClick={handleAddExercise}>
                  Add Exercise
                </Button>
              </div>

              <div className="exercise-list">
                {formData.exercises.map((exercise, index) => {
                  const exerciseErrors = formErrors.exercises?.[index] || {};
                  const nameErrorId = exerciseErrors.name ? `exercise-name-${index}-error` : undefined;
                  const setsErrorId = exerciseErrors.sets ? `exercise-sets-${index}-error` : undefined;
                  const repsErrorId = exerciseErrors.reps ? `exercise-reps-${index}-error` : undefined;

                  return (
                    <div className="workout-exercise-row" key={`exercise-${index + 1}`}>
                      <div className="ui-input-group ui-input-group--compact">
                        <label className="ui-label" htmlFor={`exercise-name-${index}`}>
                          Name
                        </label>
                        <input
                          id={`exercise-name-${index}`}
                          className={`ui-input ${exerciseErrors.name ? 'ui-input--error' : ''}`.trim()}
                          type="text"
                          list="edit-exercise-library-options"
                          value={exercise.name}
                          onChange={(event) => handleExerciseChange(index, 'name', event.target.value)}
                          aria-invalid={exerciseErrors.name ? 'true' : undefined}
                          aria-describedby={nameErrorId}
                          required
                        />
                        {exerciseErrors.name && (
                          <span id={nameErrorId} className="ui-error-text" role="alert">
                            {exerciseErrors.name}
                          </span>
                        )}
                      </div>

                      <div className="ui-input-group ui-input-group--compact">
                        <label className="ui-label" htmlFor={`exercise-sets-${index}`}>
                          Sets
                        </label>
                        <input
                          id={`exercise-sets-${index}`}
                          className={`ui-input ${exerciseErrors.sets ? 'ui-input--error' : ''}`.trim()}
                          type="number"
                          min="1"
                          max="20"
                          value={exercise.sets}
                          onChange={(event) => handleExerciseChange(index, 'sets', event.target.value)}
                          aria-invalid={exerciseErrors.sets ? 'true' : undefined}
                          aria-describedby={setsErrorId}
                          required
                        />
                        {exerciseErrors.sets && (
                          <span id={setsErrorId} className="ui-error-text" role="alert">
                            {exerciseErrors.sets}
                          </span>
                        )}
                      </div>

                      <div className="ui-input-group ui-input-group--compact">
                        <label className="ui-label" htmlFor={`exercise-reps-${index}`}>
                          Reps
                        </label>
                        <input
                          id={`exercise-reps-${index}`}
                          className={`ui-input ${exerciseErrors.reps ? 'ui-input--error' : ''}`.trim()}
                          type="number"
                          min="1"
                          max="100"
                          value={exercise.reps}
                          onChange={(event) => handleExerciseChange(index, 'reps', event.target.value)}
                          aria-invalid={exerciseErrors.reps ? 'true' : undefined}
                          aria-describedby={repsErrorId}
                          required
                        />
                        {exerciseErrors.reps && (
                          <span id={repsErrorId} className="ui-error-text" role="alert">
                            {exerciseErrors.reps}
                          </span>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        className="workout-exercise-row__remove"
                        onClick={() => handleRemoveExercise(index)}
                        disabled={formData.exercises.length === 1}
                        aria-label={`Remove exercise ${index + 1}`}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
              <datalist id="edit-exercise-library-options">
                {exerciseOptions.map((option) => (
                  <option key={option._id || option.name} value={option.name}>
                    {option.category ? `${option.category} • ${option.equipment}` : option.name}
                  </option>
                ))}
              </datalist>
            </Card.Body>
          </Card>

          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Update Workout'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditWorkout;
