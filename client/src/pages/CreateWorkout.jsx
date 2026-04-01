import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';

const defaultExercise = {
  name: '',
  sets: 3,
  reps: 10,
};

const CreateWorkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    duration: 45,
    difficulty: 'beginner',
    notes: '',
    exercises: [defaultExercise],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExerciseChange = (index, key, value) => {
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
      exercises: [...prev.exercises, defaultExercise],
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
    setIsSubmitting(true);

    const payload = {
      ...formData,
      duration: Number.parseInt(formData.duration, 10),
      exercises: formData.exercises.map((exercise) => ({
        name: exercise.name.trim(),
        sets: Number.parseInt(exercise.sets, 10),
        reps: Number.parseInt(exercise.reps, 10),
      })),
    };

    try {
      const response = await api.post('/api/workouts', payload);
      if (response.data.success) {
        toast.success('Workout created successfully!');
        navigate('/dashboard');
      }
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Failed to create workout. Please try again.');
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page page-dashboard">
      <div className="dashboard-wrap">
        <h2 className="dashboard-title">Create Workout</h2>
        <p className="dashboard-subtext">Build a routine that you can track over time.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="form form-stack workout-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="workoutName" className="form-label">
              Workout Name
            </label>
            <input
              id="workoutName"
              name="name"
              type="text"
              className="form-input"
              placeholder="Push Day, Leg Strength, HIIT Burn..."
              value={formData.name}
              onChange={handleFieldChange}
              required
            />
          </div>

          <div className="workout-form-grid">
            <div className="form-field">
              <label htmlFor="duration" className="form-label">
                Duration (minutes)
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                min="1"
                max="600"
                className="form-input"
                value={formData.duration}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="difficulty" className="form-label">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                className="form-input"
                value={formData.difficulty}
                onChange={handleFieldChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="notes" className="form-label">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              className="form-input"
              rows="4"
              maxLength="500"
              placeholder="Goals, warm-up, cooldown, or special instructions..."
              value={formData.notes}
              onChange={handleFieldChange}
            />
          </div>

          <div className="workout-exercises">
            <div className="workout-exercises__header">
              <h3 className="workout-exercises__title">Exercises</h3>
              <button type="button" className="btn btn-dark workout-exercises__add" onClick={handleAddExercise}>
                + Add Exercise
              </button>
            </div>

            {formData.exercises.map((exercise, index) => (
              <div className="workout-exercise-row" key={`exercise-${index + 1}`}>
                <div className="form-field">
                  <label className="form-label" htmlFor={`exercise-name-${index}`}>
                    Exercise Name
                  </label>
                  <input
                    id={`exercise-name-${index}`}
                    className="form-input"
                    type="text"
                    value={exercise.name}
                    onChange={(event) => handleExerciseChange(index, 'name', event.target.value)}
                    placeholder="Squat, Push Up, Plank..."
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor={`exercise-sets-${index}`}>
                    Sets
                  </label>
                  <input
                    id={`exercise-sets-${index}`}
                    className="form-input"
                    type="number"
                    min="1"
                    max="20"
                    value={exercise.sets}
                    onChange={(event) => handleExerciseChange(index, 'sets', event.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor={`exercise-reps-${index}`}>
                    Reps
                  </label>
                  <input
                    id={`exercise-reps-${index}`}
                    className="form-input"
                    type="number"
                    min="1"
                    max="100"
                    value={exercise.reps}
                    onChange={(event) => handleExerciseChange(index, 'reps', event.target.value)}
                    required
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-danger workout-exercise-row__remove"
                  onClick={() => handleRemoveExercise(index)}
                  disabled={formData.exercises.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="workout-form-actions">
            <button type="button" className="btn btn-dark" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Workout'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateWorkout;
