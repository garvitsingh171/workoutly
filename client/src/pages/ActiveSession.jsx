import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const ActiveSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState([]);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const timerRef = useRef(null);
  const startedAtRef = useRef(new Date());

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await api.get(`/api/workouts/${id}`);
        const fetchedWorkout = response.data.data;
        setWorkout(fetchedWorkout);
        startedAtRef.current = new Date();

        const initialSession = fetchedWorkout.exercises.map((exercise) => ({
          ...exercise,
          setLogs: Array.from({ length: exercise.sets }, () => ({
            completed: false,
            weight: '',
            reps: exercise.reps,
          })),
        }));
        setSessionData(initialSession);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load workout.'));
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();

    return () => clearInterval(timerRef.current);
  }, [id, navigate]);

  const startRestTimer = (seconds) => {
    clearInterval(timerRef.current);
    setRestTimer(seconds);
    setIsResting(true);

    timerRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsResting(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const stopRestTimer = () => {
    clearInterval(timerRef.current);
    setIsResting(false);
    setRestTimer(0);
  };

  const toggleSet = (exIndex, setIndex) => {
    setSessionData((prev) => {
      const newData = [...prev];
      const setLogs = [...newData[exIndex].setLogs];
      const currentLog = newData[exIndex].setLogs[setIndex];
      const isCompleting = !currentLog.completed;

      setLogs[setIndex] = {
        ...currentLog,
        completed: isCompleting,
      };
      newData[exIndex] = {
        ...newData[exIndex],
        setLogs,
      };

      if (isCompleting) {
        const restSeconds = Number(newData[exIndex].restSeconds) || 0;

        if (restSeconds > 0) {
          startRestTimer(restSeconds);
        } else {
          stopRestTimer();
        }
      } else {
        stopRestTimer();
      }

      return newData;
    });
  };

  const handleLogChange = (exIndex, setIndex, field, value) => {
    setSessionData((prev) => {
      const newData = [...prev];
      const setLogs = [...newData[exIndex].setLogs];
      setLogs[setIndex] = {
        ...newData[exIndex].setLogs[setIndex],
        [field]: value,
      };
      newData[exIndex] = {
        ...newData[exIndex],
        setLogs,
      };
      return newData;
    });
  };

  const finishWorkout = async () => {
    setSaveError('');

    const hasCompletedSet = sessionData.some((exercise) =>
      exercise.setLogs.some((log) => log.completed)
    );

    if (!hasCompletedSet) {
      const message = 'Mark at least one set complete before finishing this workout.';
      setSaveError(message);
      toast.error(message);
      return;
    }

    setIsSaving(true);

    const completedAt = new Date();
    const durationMinutes = Math.max(
      1,
      Math.round((completedAt.getTime() - startedAtRef.current.getTime()) / 60000)
    );

    const payload = {
      workout: workout._id,
      workoutName: workout.name,
      startedAt: startedAtRef.current.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMinutes,
      exercises: sessionData.map((exercise) => ({
        name: exercise.name,
        sets: exercise.setLogs.map((log, index) => ({
          setNumber: index + 1,
          targetReps: Number(exercise.reps) || 0,
          actualReps: Number(log.reps) || 0,
          weight: Number(log.weight) || 0,
          completed: Boolean(log.completed),
        })),
      })),
    };

    try {
      const response = await api.post('/api/sessions', payload);
      if (Array.isArray(response.data.newRecords) && response.data.newRecords.length > 0) {
        toast.success('New personal record achieved!');
      }
      toast.success('Workout completed and saved. Great job!');
      navigate('/dashboard');
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to save workout session.');
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="loading-spinner" aria-hidden="true"></div>
        <p className="loading-spinner__text">Loading session...</p>
      </div>
    );
  }

  if (!workout) return null;

  const totalSets = sessionData.reduce((count, exercise) => count + exercise.setLogs.length, 0);
  const completedSets = sessionData.reduce(
    (count, exercise) => count + exercise.setLogs.filter((log) => log.completed).length,
    0
  );
  const sessionProgress = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <div className="active-session">
      <header className="session-header">
        <div className="session-header__inner">
          <div>
            <Badge color="accent">Active Session</Badge>
            <h1>{workout.name}</h1>
            <p className="session-header__meta">
              {sessionData.length} exercises • {completedSets} of {totalSets} sets complete • {workout.duration || 0} minute routine
            </p>
            <div className="session-header__progress" aria-label={`Session progress ${sessionProgress}%`}>
              <span style={{ width: `${sessionProgress}%` }} />
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} size="sm">
            Exit
          </Button>
        </div>
      </header>

      <main className="session-content">
        {saveError && <div className="alert alert-error">{saveError}</div>}

        {sessionData.map((exercise, exIndex) => (
          <Card key={exIndex} className="session-exercise-card">
            <Card.Header className="session-exercise-header">
              <h2>{exercise.name}</h2>
              <p>
                Target: {exercise.sets} sets x {exercise.reps} reps
                {Number(exercise.restSeconds) > 0 ? ` - ${exercise.restSeconds}s rest` : ''}
              </p>
              {exercise.notes && <p className="session-exercise-header__notes">{exercise.notes}</p>}
            </Card.Header>

            <div className="session-set-list">
              <div className="session-set-grid session-set-head" aria-hidden="true">
                <div>Set</div>
                <div>Weight</div>
                <div>Reps</div>
                <div>Done</div>
              </div>

              {exercise.setLogs.map((log, setIndex) => (
                <div
                  key={setIndex}
                  className={`session-set-grid session-set-row ${log.completed ? 'session-set-row--completed' : ''}`.trim()}
                >
                  <div className="session-set-number">{setIndex + 1}</div>

                  <div>
                    <label className="sr-only" htmlFor={`weight-${exIndex}-${setIndex}`}>
                      {exercise.name} set {setIndex + 1} weight
                    </label>
                    <input
                      id={`weight-${exIndex}-${setIndex}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.5"
                      placeholder="-"
                      value={log.weight}
                      onChange={(event) => handleLogChange(exIndex, setIndex, 'weight', event.target.value)}
                      disabled={log.completed}
                      className="session-input"
                    />
                  </div>

                  <div>
                    <label className="sr-only" htmlFor={`reps-${exIndex}-${setIndex}`}>
                      {exercise.name} set {setIndex + 1} reps
                    </label>
                    <input
                      id={`reps-${exIndex}-${setIndex}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="100"
                      value={log.reps}
                      onChange={(event) => handleLogChange(exIndex, setIndex, 'reps', event.target.value)}
                      disabled={log.completed}
                      className="session-input"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSet(exIndex, setIndex)}
                      className={`session-complete-btn ${log.completed ? 'session-complete-btn--done' : ''}`.trim()}
                      aria-pressed={log.completed}
                      aria-label={`${log.completed ? 'Mark incomplete' : 'Mark complete'}: ${exercise.name} set ${setIndex + 1}`}
                    >
                      {log.completed ? 'Done' : 'Mark'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </main>

      {isResting && (
        <div className="rest-timer" role="status" aria-live="polite">
          <span className="rest-timer__label">Rest</span>
          <strong className="rest-timer__time">{formatTime(restTimer)}</strong>
          <button type="button" onClick={stopRestTimer} className="rest-timer__skip">
            Skip
          </button>
        </div>
      )}

      <div className="session-finish-bar">
        <div className="session-finish-bar__inner">
          {completedSets === 0 && (
            <p className="session-finish-bar__hint">Mark at least one set complete to finish.</p>
          )}
          <Button variant="primary" fullWidth size="lg" onClick={finishWorkout} disabled={isSaving || completedSets === 0}>
            {isSaving ? 'Saving Workout...' : 'Finish Workout'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActiveSession;
