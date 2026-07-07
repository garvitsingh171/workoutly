import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import socket from '../services/socket';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressInsights from '../components/dashboard/ProgressInsights';
import AchievementSection from '../components/dashboard/AchievementSection';

const getDifficultyColor = (difficulty) => {
  if (difficulty === 'beginner') return 'success';
  if (difficulty === 'intermediate') return 'warning';
  if (difficulty === 'advanced') return 'danger';
  return 'neutral';
};

const getUtcDateKey = (date) => date.toISOString().slice(0, 10);

const labelize = (value) => {
  const words = String(value || 'other').replace('_', ' ').split(' ');
  return words.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
};

const buildWeeklyActivity = (calendarDays) => {
  const calendarLookup = calendarDays.reduce((lookup, day) => {
    lookup.set(day.date, day);
    return lookup;
  }, new Map());

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (6 - index));
    const dateKey = getUtcDateKey(date);
    const summary = calendarLookup.get(dateKey);

    return {
      dateKey,
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      sessionCount: summary?.sessionCount || 0,
      totalVolume: summary?.totalVolume || 0,
    };
  });
};

const getMostTrainedGroup = ({ recentSessions, workouts, exerciseCategoryLookup }) => {
  const categoryCounts = new Map();
  const hasSessionData = recentSessions.length > 0;
  const source = hasSessionData ? recentSessions : workouts;

  const addExercise = (exercise, amount = 1) => {
    const category = exerciseCategoryLookup.get(String(exercise.name || '').toLowerCase()) || 'other';
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + amount);
  };

  if (hasSessionData) {
    source.forEach((session) => {
      (session.exercises || []).forEach((exercise) => {
        const completedSets = (exercise.sets || []).filter((set) => set.completed).length;
        addExercise(exercise, completedSets || exercise.sets?.length || 1);
      });
    });
  } else {
    source.forEach((workout) => {
      (workout.exercises || []).forEach((exercise) => {
        addExercise(exercise, Number(exercise.sets) || 1);
      });
    });
  }

  const [category, count] = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0] || [];

  if (!category) {
    return null;
  }

  return {
    label: labelize(category),
    detail: `${count} ${hasSessionData ? 'sets logged' : 'sets planned'}`,
  };
};

const Dashboard = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [workoutsError, setWorkoutsError] = useState('');
  const [recentSessions, setRecentSessions] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [duplicatingWorkoutId, setDuplicatingWorkoutId] = useState('');
  const [sessionSummary, setSessionSummary] = useState({
    totalSessions: 0,
    totalCompletedSets: 0,
    totalVolume: 0,
    totalDurationMinutes: 0,
    averageDurationMinutes: 0,
    latestSession: null,
    sessionsThisWeek: 0,
    currentStreakDays: 0,
  });
  const [goalSummary, setGoalSummary] = useState(null);
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

    socket.on('connect_error', () => {});

    return () => {
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

  const fetchWorkouts = useCallback(async () => {
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
  }, [currentPage]);

  const fetchSessionSummary = useCallback(async () => {
    setSummaryError('');

    try {
      const response = await api.get('/api/sessions/summary');
      setSessionSummary((prevSummary) => ({
        ...prevSummary,
        ...(response.data.data || {}),
      }));
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to load workout stats.');
      setSummaryError(message);
    }
  }, []);

  const fetchGoalSummary = useCallback(async () => {
    try {
      const response = await api.get('/api/goals/summary');
      setGoalSummary(response.data.data || null);
    } catch {
      setGoalSummary(null);
    }
  }, []);

  const fetchDashboardInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError('');

    const [recentResult, calendarResult, exercisesResult] = await Promise.allSettled([
      api.get('/api/sessions/recent'),
      api.get('/api/sessions/calendar'),
      api.get('/api/exercises'),
    ]);

    const errors = [];

    if (recentResult.status === 'fulfilled') {
      setRecentSessions(recentResult.value.data.data || []);
    } else {
      errors.push(getErrorMessage(recentResult.reason, 'Failed to load recent sessions.'));
    }

    if (calendarResult.status === 'fulfilled') {
      setCalendarDays(calendarResult.value.data.data || []);
    } else {
      errors.push(getErrorMessage(calendarResult.reason, 'Failed to load weekly activity.'));
    }

    if (exercisesResult.status === 'fulfilled') {
      setExerciseOptions(exercisesResult.value.data.data || []);
    } else {
      errors.push(getErrorMessage(exercisesResult.reason, 'Failed to load muscle group data.'));
    }

    if (errors.length > 0) {
      setInsightsError(errors[0]);
    }

    setInsightsLoading(false);
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  useEffect(() => {
    fetchSessionSummary();
  }, [fetchSessionSummary]);

  useEffect(() => {
    fetchGoalSummary();
  }, [fetchGoalSummary]);

  useEffect(() => {
    fetchDashboardInsights();
  }, [fetchDashboardInsights]);

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

  const handleDuplicateWorkout = async (workoutId) => {
    setActionError('');
    setDuplicatingWorkoutId(workoutId);

    try {
      const response = await api.post(`/api/workouts/${workoutId}/duplicate`);
      if (response.data.success) {
        toast.success('Workout duplicated successfully!');
        await fetchWorkouts();
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to duplicate workout.');
      setActionError(message);
      toast.error(message);
    } finally {
      setDuplicatingWorkoutId('');
    }
  };

  const totalRoutines = pagination.total || workouts.length;
  const totalVolume = Math.round(sessionSummary.totalVolume || 0);
  const totalMinutes = Math.round(sessionSummary.totalDurationMinutes || 0);
  const averageDurationMinutes = Math.round(sessionSummary.averageDurationMinutes || 0);
  const weeklyTarget = goalSummary?.weeklyWorkoutTarget || 0;
  const weeklyCompletionPercent = goalSummary?.weeklyProgressPercent
    ?? (weeklyTarget ? Math.min(100, Math.round(((sessionSummary.sessionsThisWeek || 0) / weeklyTarget) * 100)) : 0);
  const athleteName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Athlete';
  const weeklyActivity = useMemo(() => buildWeeklyActivity(calendarDays), [calendarDays]);
  const exerciseCategoryLookup = useMemo(() => {
    return exerciseOptions.reduce((lookup, exercise) => {
      lookup.set(exercise.name.toLowerCase(), exercise.category || 'other');
      return lookup;
    }, new Map());
  }, [exerciseOptions]);
  const mostTrainedGroup = useMemo(
    () => getMostTrainedGroup({ recentSessions, workouts, exerciseCategoryLookup }),
    [exerciseCategoryLookup, recentSessions, workouts]
  );
  const recentSession = recentSessions[0] || sessionSummary.latestSession;
  const useDemoInsights =
    !insightsLoading && !recentSession && (sessionSummary.totalSessions || 0) === 0;

  if (loading) {
    return (
      <div className="page-state">
        <div className="loading-spinner" aria-hidden="true"></div>
        <p className="loading-spinner__text">Loading dashboard...</p>
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
        {summaryError && <div className="alert alert-error">{summaryError}</div>}
        {insightsError && <div className="alert alert-error">{insightsError}</div>}

        <div className="stats-grid" aria-label="Workout summary">
          <article className="stat-card">
            <p className="stat-card__label">Total routines</p>
            <p className="stat-card__value">{totalRoutines}</p>
            <p className="stat-card__hint">Saved workout templates</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Completed sessions</p>
            <p className="stat-card__value">{sessionSummary.totalSessions || 0}</p>
            <p className="stat-card__hint">Finished workouts saved</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Minutes trained</p>
            <p className="stat-card__value">{totalMinutes}</p>
            <p className="stat-card__hint">Lifetime logged training time</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Sessions this week</p>
            <p className="stat-card__value">{sessionSummary.sessionsThisWeek || 0}</p>
            <p className="stat-card__hint">Since the start of this week</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Weekly completion</p>
            <p className="stat-card__value">{weeklyCompletionPercent}%</p>
            <p className="stat-card__hint">
              {weeklyTarget ? `${sessionSummary.sessionsThisWeek || 0} / ${weeklyTarget} target sessions` : 'Set a weekly goal'}
            </p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Total volume</p>
            <p className="stat-card__value">{totalVolume}</p>
            <p className="stat-card__hint">{sessionSummary.totalCompletedSets || 0} completed sets</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Average session</p>
            <p className="stat-card__value">{averageDurationMinutes}</p>
            <p className="stat-card__hint">Minutes per completed workout</p>
          </article>
          {goalSummary && (
            <article className="stat-card dashboard-goal-card">
              <p className="stat-card__label">Weekly goal</p>
              <p className="stat-card__value">
                {goalSummary.sessionsThisWeek || 0} / {goalSummary.weeklyWorkoutTarget || 3}
              </p>
              <p className="stat-card__hint">
                This week · Current streak: {goalSummary.currentStreakDays || 0} days
              </p>
            </article>
          )}
        </div>

        <ProgressInsights
          loading={insightsLoading}
          isDemo={useDemoInsights}
          totalWorkouts={sessionSummary.totalSessions || 0}
          weeklyActivity={weeklyActivity}
          streakDays={sessionSummary.currentStreakDays || goalSummary?.currentStreakDays || 0}
          mostTrainedGroup={mostTrainedGroup}
          recentSession={recentSession}
        />

        <AchievementSection
          summary={sessionSummary}
          goalSummary={goalSummary}
          loading={insightsLoading}
        />

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
                          {Number(exercise.restSeconds) > 0 ? ` - ${exercise.restSeconds}s rest` : ''}
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
                        variant="ghost"
                        onClick={() => handleDuplicateWorkout(workout._id)}
                        disabled={duplicatingWorkoutId === workout._id}
                        fullWidth
                      >
                        {duplicatingWorkoutId === workout._id ? 'Copying...' : 'Duplicate'}
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
