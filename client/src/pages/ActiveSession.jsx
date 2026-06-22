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
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await api.get(`/api/workouts/${id}`);
        const fetchedWorkout = response.data.data;
        setWorkout(fetchedWorkout);

        const initialSession = fetchedWorkout.exercises.map((exercise) => ({
          ...exercise,
          setLogs: Array(exercise.sets).fill({ completed: false, weight: '', reps: exercise.reps }),
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
      const currentLog = newData[exIndex].setLogs[setIndex];
      const isCompleting = !currentLog.completed;

      newData[exIndex].setLogs[setIndex] = {
        ...currentLog,
        completed: isCompleting,
      };

      if (isCompleting) {
        startRestTimer(90);
      } else {
        stopRestTimer();
      }

      return newData;
    });
  };

  const handleLogChange = (exIndex, setIndex, field, value) => {
    setSessionData((prev) => {
      const newData = [...prev];
      newData[exIndex].setLogs[setIndex] = {
        ...newData[exIndex].setLogs[setIndex],
        [field]: value,
      };
      return newData;
    });
  };

  const finishWorkout = () => {
    // TODO: Send sessionData to a new backend endpoint for history tracking.
    toast.success('Workout completed. Great job!');
    navigate('/dashboard');
  };

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <div className="page-state">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!workout) return null;

  return (
    <div className="active-session">
      <header className="session-header">
        <div className="session-header__inner">
          <div>
            <Badge color="accent">Active Session</Badge>
            <h1>{workout.name}</h1>
            <p className="session-header__meta">
              {sessionData.length} exercises • {workout.duration || 0} minute routine
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} size="sm">
            Exit
          </Button>
        </div>
      </header>

      <main className="session-content">
        {sessionData.map((exercise, exIndex) => (
          <Card key={exIndex} className="session-exercise-card">
            <Card.Header className="session-exercise-header">
              <h2>{exercise.name}</h2>
              <p>Target: {exercise.sets} sets x {exercise.reps} reps</p>
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
          <Button variant="primary" fullWidth size="lg" onClick={finishWorkout}>
            Finish Workout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActiveSession;
