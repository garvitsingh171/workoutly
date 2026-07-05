import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import WorkoutBuilder from '../components/workouts/WorkoutBuilder';
import {
  normalizeWorkoutFormData,
  serializeWorkoutForm,
} from '../utils/workoutBuilderUtils';

const EditWorkout = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialWorkoutData, setInitialWorkoutData] = useState(null);
  const [currentCoverImage, setCurrentCoverImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkout = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await api.get(`/api/workouts/${id}`);
        const workout = response.data.data;
        setInitialWorkoutData(normalizeWorkoutFormData(workout));
        setCurrentCoverImage(workout.coverImage || null);
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

  const handleSubmit = async (formData) => {
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.put(
        `/api/workouts/${id}`,
        serializeWorkoutForm(formData, { coverImage: currentCoverImage })
      );
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

  if (error && !initialWorkoutData) {
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
    <section className="page page-form page-workout-builder">
      <div className="form-page-wrap form-page-wrap--builder">
        <header className="page-heading">
          <Badge color="primary" className="page-heading__eyebrow">Routine Editor</Badge>
          <h1 className="page-heading__title">Edit Workout</h1>
          <p className="page-heading__text">
            Refine the order, targets, rest timing, and notes for this saved routine.
          </p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <WorkoutBuilder
          key={id}
          initialData={initialWorkoutData}
          isSubmitting={isSubmitting}
          submitLabel="Update Workout"
          submittingLabel="Saving..."
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard')}
        />
      </div>
    </section>
  );
};

export default EditWorkout;
