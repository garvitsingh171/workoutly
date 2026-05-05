import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import hotToast from 'react-hot-toast';
import api, { getErrorMessage } from '../services/api';
import socket from '../services/socket';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

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
      <div className="dashboard-wrap" style={{ width: 'min(980px, 100%)', margin: '0 auto' }}>
        
        {/* Profile Header Widget */}
        <Card style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white', border: 'none' }}>
          <Card.Body className="dashboard-card-body">
            <div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '2rem' }}>Welcome back, {profile?.name?.split(' ')[0] || 'Athlete'}!</h2>
              <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>Ready to crush your goals today?</p>
            </div>
            <div className="dashboard-card-actions">
               <Button variant="ghost" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }} onClick={logout} fullWidth>
                Logout
              </Button>
            </div>
          </Card.Body>
        </Card>

        {profileError && <div className="alert alert-error">{profileError}</div>}
        {workoutsError && <div className="alert alert-error">{workoutsError}</div>}
        {actionError && <div className="alert alert-error">{actionError}</div>}

        {/* Workout List Section */}
        <div className="dashboard-section-header">
          <h3 style={{ margin: 0 }}>Your Routines</h3>
          <Link to="/workouts/create" style={{ textDecoration: 'none' }}>
            <Button variant="primary" fullWidth>+ Create Routine</Button>
          </Link>
        </div>

        {workoutsLoading ? (
          <p className="dashboard-subtext">Loading workouts...</p>
        ) : workouts.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.5)' }}>
            <Card.Body>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏋️</div>
              <h3 style={{ marginBottom: '0.5rem' }}>No routines yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Create your first workout routine to start tracking your progress and hitting PRs.
              </p>
              <Link to="/workouts/create" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg">Create First Workout</Button>
              </Link>
            </Card.Body>
          </Card>
        ) : (
          <>
            <div className="dashboard-grid">
              {workouts.map((workout) => (
                <Card key={workout._id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {workout.coverImage && (
                    <img
                      src={workout.coverImage}
                      alt={workout.name}
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                        borderTopLeftRadius: 'var(--radius-lg)',
                        borderTopRightRadius: 'var(--radius-lg)'
                      }}
                    />
                  )}
                  
                  <Card.Body style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{workout.name}</h4>
                      <Badge color={workout.difficulty === 'beginner' ? 'success' : workout.difficulty === 'intermediate' ? 'warning' : 'primary'}>
                        {workout.difficulty}
                      </Badge>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      {workout.duration} min • {workout.exercises?.length || 0} exercises
                    </p>

                    <ul style={{ margin: '0 0 1rem 0', padding: 0, listStyle: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', flex: 1 }}>
                      {(workout.exercises || []).slice(0, 3).map((exercise, index) => (
                        <li key={index} style={{ marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          • {exercise.sets}x{exercise.reps} {exercise.name}
                        </li>
                      ))}
                      {(workout.exercises?.length > 3) && <li>• ...and more</li>}
                    </ul>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <Link to={`/workouts/session/${workout._id}`} style={{ flex: 2, textDecoration: 'none' }}>
                        <Button variant="primary" fullWidth>Start Session</Button>
                      </Link>
                      <Link to={`/workouts/edit/${workout._id}`} style={{ flex: 1, textDecoration: 'none' }}>
                        <Button variant="secondary" fullWidth>Edit</Button>
                      </Link>
                      <Button variant="danger" onClick={() => handleDeleteWorkout(workout._id)}>
                         ✕
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
                  fullWidth
                >
                  Previous
                </Button>
                <span style={{ color: 'var(--text-muted)' }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button 
                  variant="ghost" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  fullWidth
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
