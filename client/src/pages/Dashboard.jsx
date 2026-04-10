import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import hotToast from 'react-hot-toast';
import api, { getErrorMessage } from '../services/api';
import socket from '../services/socket';

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

    socket.on('newWorkout', (data) => {
      hotToast.success(data.message);
    })

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('newWorkout');
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

    if (!confirmed) {
      return;
    }

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
        <h2 className="dashboard-title">Dashboard</h2>
        <p className="dashboard-subtext">Manage your profile and your workout history.</p>

        {profileLoading && <p className="dashboard-subtext">Loading your profile from API...</p>}
        {profileError && <div className="alert alert-error">{profileError}</div>}

        <div className="dashboard-card">
          <p className="dashboard-item">
            <strong>Name:</strong> {profile?.name || user?.name || 'N/A'}
          </p>
          <p className="dashboard-item">
            <strong>Email:</strong> {profile?.email || user?.email || 'N/A'}
          </p>
          <p className="dashboard-item">
            <strong>User ID:</strong> {profile?._id || user?._id || 'N/A'}
          </p>
        </div>

        <div className="workout-list-wrap">
          <div className="workout-list-header">
            <h3 className="workout-list-title">Your Workouts</h3>
            <Link to="/workouts/create" className="btn btn-primary workout-list-create-btn">
              + Create Workout
            </Link>
          </div>

          {workoutsError && <div className="alert alert-error">{workoutsError}</div>}
          {actionError && <div className="alert alert-error">{actionError}</div>}

          {workoutsLoading ? (
            <p className="dashboard-subtext">Loading workouts...</p>
          ) : workouts.length === 0 ? (
            <div className="workout-empty-state">
              <p>You have not created any workouts yet.</p>
              <Link to="/workouts/create" className="auth-link">
                Create your first workout
              </Link>
            </div>
          ) : (
            <>
              <div className="workout-card-grid">
                {workouts.map((workout) => (
                  <article className="workout-card" key={workout._id}>
                    {workout.coverImage && (
                      <img
                        src={workout.coverImage}
                        alt={`Cover image for ${workout.name}`}
                        style={{
                          width: '100%',
                          maxHeight: '180px',
                          objectFit: 'cover',
                          borderRadius: '0.9rem',
                          marginBottom: '0.75rem',
                        }}
                      />
                    )}

                    <div className="workout-card-top">
                      <h4 className="workout-card-title">{workout.name}</h4>
                      <span className="workout-badge">{workout.difficulty}</span>
                    </div>

                    <p className="workout-card-meta">
                      Duration: <strong>{workout.duration} min</strong>
                    </p>
                    <p className="workout-card-meta">
                      Exercises: <strong>{workout.exercises?.length || 0}</strong>
                    </p>

                    <ul className="workout-exercise-preview">
                      {(workout.exercises || []).slice(0, 3).map((exercise, index) => (
                        <li key={`${workout._id}-${exercise.name}-${index + 1}`}>
                          {exercise.name}: {exercise.sets} sets x {exercise.reps} reps
                        </li>
                      ))}
                    </ul>

                    {workout.notes ? <p className="workout-card-notes">{workout.notes}</p> : null}

                    <div className="workout-card-actions">
                      <Link to={`/workouts/edit/${workout._id}`} className="btn btn-dark workout-card-action-btn">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger workout-card-action-btn"
                        onClick={() => handleDeleteWorkout(workout._id)}
                      >
                        Delete
                      </button>
                    </div>

                    <p className="workout-card-date">
                      Created on {new Date(workout.createdAt).toLocaleDateString()}
                    </p>
                  </article>
                ))}
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="btn btn-dark pagination-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </button>

                <p className="pagination-info">
                  Page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} total workouts)
                </p>

                <button
                  type="button"
                  className="btn btn-dark pagination-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>
    </section>
  );
};

export default Dashboard;
