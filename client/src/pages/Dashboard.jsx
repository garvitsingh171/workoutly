import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import socket from '../services/socket';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const getDifficultyColor = (difficulty) => {
  if (difficulty === 'beginner') return 'success';
  if (difficulty === 'intermediate') return 'warning';
  if (difficulty === 'advanced') return 'danger';
  return 'neutral';
};

const Dashboard = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [workoutsError, setWorkoutsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket auth error:', error.message)
    })

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) {
        setProfileLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/users/${user._id}`);
        setProfile(response.data.data);
      } catch (error) {
        const message = getErrorMessage(error, 'Failed to load profile data.');
        setProfileError(message);
        toast.error(message);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user?._id]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setWorkoutsLoading(true);
      setWorkoutsError('');

      try {
        const response = await api.get(`/api/workouts?page=${currentPage}&limit=10`);
        setWorkouts(response.data.data || []);
        setPagination(
          response.data.pagination || {
            page: currentPage,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
      } catch (error) {
        const message = getErrorMessage(error, 'Failed to load workouts.');
        setWorkoutsError(message);
        toast.error(message);
      } finally {
        setWorkoutsLoading(false);
      }
    };

    fetchWorkouts();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page === currentPage) {
      return;
    }
    setCurrentPage(page);
  };

  const handleDeleteWorkout = async (workoutId) => {
    const confirmed = window.confirm('Are you sure you want to delete this workout? This action cannot be undone.');
    if (!confirmed) return;

    setActionError('');

    try {
      const response = await api.delete(`/api/workouts/${workoutId}`);
      if (response.data.success) {
        setWorkouts((prevWorkouts) => prevWorkouts.filter((workout) => workout._id !== workoutId));
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        toast.success('Workout deleted successfully!');
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete workout.');
      setActionError(message);
      toast.error(message);
    }
  };

  const totalRoutines = workouts.length;
  const totalExercises = workouts.reduce((total, workout) => total + (workout.exercises?.length || 0), 0);
  const totalDuration = workouts.reduce((total, workout) => total + (Number(workout.duration) || 0), 0);
  const averageDuration = totalRoutines > 0 ? Math.round(totalDuration / totalRoutines) : 0;
  const difficultyCounts = workouts.reduce(
    (counts, workout) => ({
      ...counts,
      [workout.difficulty]: (counts[workout.difficulty] || 0) + 1,
    }),
    { beginner: 0, intermediate: 0, advanced: 0 }
  );
  const athleteName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Athlete';

  if (loading) {
    return (
      <div className="page-state">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="page page-dashboard">
      <div className="dashboard-wrap">
        <section className="dashboard-hero">
          <div className="dashboard-hero__content">
            <Badge color="primary">Dashboard</Badge>
            <h1 className="dashboard-hero__title">Welcome back, {athleteName}.</h1>
            <p className="dashboard-hero__text">
              {profileLoading
                ? 'Loading your athlete profile while your routines come into view.'
                : 'Review your routines, start a live session, or build the next template in your training plan.'}
            </p>
          </div>
          <div className="dashboard-hero__actions">
            <Button as={Link} to="/workouts/create" variant="primary">
              Create Routine
            </Button>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </section>

        {profileError && <div className="alert alert-error">{profileError}</div>}
        {workoutsError && <div className="alert alert-error">{workoutsError}</div>}
        {actionError && <div className="alert alert-error">{actionError}</div>}

        <div className="stats-grid" aria-label="Workout summary">
          <article className="stat-card">
            <p className="stat-card__label">Total routines</p>
            <p className="stat-card__value">{totalRoutines}</p>
            <p className="stat-card__hint">Loaded in this view</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Total exercises</p>
            <p className="stat-card__value">{totalExercises}</p>
            <p className="stat-card__hint">Across loaded routines</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Average duration</p>
            <p className="stat-card__value">{averageDuration}m</p>
            <p className="stat-card__hint">Based on routine duration</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Difficulty mix</p>
            <p className="stat-card__value">
              {difficultyCounts.beginner}/{difficultyCounts.intermediate}/{difficultyCounts.advanced}
            </p>
            <p className="stat-card__hint">Beginner / Intermediate / Advanced</p>
          </article>
        </div>

        <div className="dashboard-toolbar">
          <div>
            <h3>Your Routines</h3>
            <p className="dashboard-subtext">Start, edit, or remove workout templates from your current routine list.</p>
          </div>
          <Button as={Link} to="/workouts/create" variant="primary">
            Create Routine
          </Button>
        </div>

        {workoutsLoading ? (
          <Card className="empty-state">
            <Card.Body>
              <div className="loading-spinner" aria-hidden="true"></div>
              <p className="dashboard-subtext">Loading workouts...</p>
            </Card.Body>
          </Card>
        ) : workouts.length === 0 ? (
          <Card className="empty-state">
            <Card.Body>
              <div className="empty-state__mark" aria-hidden="true">W</div>
              <h3>No routines yet</h3>
              <p>
                Create your first workout routine to start tracking exercises, sets, reps, and session notes.
              </p>
              <Button as={Link} to="/workouts/create" variant="primary" size="lg">
                Create First Workout
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            <div className="workout-grid">
              {workouts.map((workout) => (
                <Card key={workout._id} className="workout-card">
                  {workout.coverImage ? (
                    <img
                      src={workout.coverImage}
                      alt={workout.name}
                      className="workout-card__image"
                    />
                  ) : (
                    <div className="workout-card__image-placeholder">Routine</div>
                  )}

                  <Card.Body className="workout-card__body">
                    <div className="workout-card__header">
                      <h4 className="workout-card__title">{workout.name}</h4>
                      <Badge color={getDifficultyColor(workout.difficulty)}>
                        {workout.difficulty || 'Custom'}
                      </Badge>
                    </div>

                    <div className="workout-card__meta">
                      <span>{workout.duration || 0} min</span>
                      <span>{workout.exercises?.length || 0} exercises</span>
                    </div>

                    {workout.notes && (
                      <p className="workout-card__notes">{workout.notes}</p>
                    )}

                    <ul className="workout-card__exercise-list">
                      {(workout.exercises || []).slice(0, 3).map((exercise, index) => (
                        <li key={index} className="workout-card__exercise">
                          {exercise.sets}x{exercise.reps} {exercise.name}
                        </li>
                      ))}
                      {workout.exercises?.length > 3 && (
                        <li className="workout-card__exercise">and {workout.exercises.length - 3} more</li>
                      )}
                      {!workout.exercises?.length && (
                        <li className="workout-card__exercise">No exercises added yet</li>
                      )}
                    </ul>

                    <div className="workout-card__actions">
                      <Button as={Link} to={`/workouts/session/${workout._id}`} variant="primary" fullWidth>
                        Start
                      </Button>
                      <Button as={Link} to={`/workouts/edit/${workout._id}`} variant="secondary" fullWidth>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteWorkout(workout._id)}
                        aria-label={`Delete ${workout.name}`}
                        fullWidth
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="dashboard-pagination">
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
