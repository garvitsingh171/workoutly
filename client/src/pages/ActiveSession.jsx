import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { toast } from 'react-toastify';
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
        const w = response.data.data;
        setWorkout(w);
        
        // Initialize session data with unchecked state
        const initialSession = w.exercises.map(ex => ({
          ...ex,
          setLogs: Array(ex.sets).fill({ completed: false, weight: '', reps: ex.reps })
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

  const toggleSet = (exIndex, setIndex) => {
    setSessionData(prev => {
      const newData = [...prev];
      const currentLog = newData[exIndex].setLogs[setIndex];
      const isCompleting = !currentLog.completed;
      
      newData[exIndex].setLogs[setIndex] = {
        ...currentLog,
        completed: isCompleting
      };

      if (isCompleting) {
        startRestTimer(90); // 90 seconds default rest
      } else {
        stopRestTimer();
      }

      return newData;
    });
  };

  const handleLogChange = (exIndex, setIndex, field, value) => {
    setSessionData(prev => {
      const newData = [...prev];
      newData[exIndex].setLogs[setIndex] = {
        ...newData[exIndex].setLogs[setIndex],
        [field]: value
      };
      return newData;
    });
  };

  const startRestTimer = (seconds) => {
    clearInterval(timerRef.current);
    setRestTimer(seconds);
    setIsResting(true);
    
    timerRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsResting(false);
          // Optional: trigger sound here
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

  const finishWorkout = () => {
    // TODO: Send sessionData to a new backend endpoint for history tracking
    toast.success('Workout completed! Great job! 🎉');
    navigate('/dashboard');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="page-state"><p>Loading session...</p></div>;
  if (!workout) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '100px' }}>
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--surface)', padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{workout.name}</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Active Session</span>
        </div>
        <Button variant="ghost" onClick={() => navigate('/dashboard')} size="sm">Exit</Button>
      </div>

      <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
        {sessionData.map((ex, exIndex) => (
          <Card key={exIndex} style={{ marginBottom: '1.5rem' }}>
            <Card.Header style={{ background: 'linear-gradient(to right, rgba(255, 81, 0, 0.05), transparent)' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{ex.name}</h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Target: {ex.sets} sets x {ex.reps} reps</p>
            </Card.Header>
            <div style={{ padding: '0.5rem 1rem' }}>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 60px', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <div style={{ textAlign: 'center' }}>Set</div>
                <div>Lbs/Kg</div>
                <div>Reps</div>
                <div style={{ textAlign: 'center' }}>Done</div>
              </div>
              
              {/* Set rows */}
              {ex.setLogs.map((log, setIndex) => (
                <div key={setIndex} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 60px', gap: '0.5rem', padding: '0.5rem 0', alignItems: 'center', background: log.completed ? 'rgba(16, 185, 129, 0.05)' : 'transparent', transition: 'background 0.2s' }}>
                  <div style={{ textAlign: 'center', fontWeight: 600, color: log.completed ? 'var(--success)' : 'var(--text-muted)' }}>
                    {setIndex + 1}
                  </div>
                  <div>
                    <input 
                      type="number" 
                      placeholder="-" 
                      value={log.weight}
                      onChange={(e) => handleLogChange(exIndex, setIndex, 'weight', e.target.value)}
                      disabled={log.completed}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center', background: log.completed ? 'transparent' : 'var(--surface)' }}
                    />
                  </div>
                  <div>
                    <input 
                      type="number" 
                      value={log.reps}
                      onChange={(e) => handleLogChange(exIndex, setIndex, 'reps', e.target.value)}
                      disabled={log.completed}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center', background: log.completed ? 'transparent' : 'var(--surface)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                      onClick={() => toggleSet(exIndex, setIndex)}
                      style={{ 
                        width: '36px', height: '36px', borderRadius: '8px', 
                        background: log.completed ? 'var(--success)' : 'var(--surface)', 
                        border: `2px solid ${log.completed ? 'var(--success)' : 'var(--border)'}`,
                        color: log.completed ? 'white' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      {log.completed && '✓'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Floating Rest Timer */}
      {isResting && (
        <div style={{ position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', borderRadius: 'var(--radius-full)', padding: '0.5rem 1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 50, border: '1px solid var(--primary)' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem', fontVariantNumeric: 'tabular-nums' }}>
            ⏱ {formatTime(restTimer)}
          </div>
          <button onClick={stopRestTimer} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem' }}>Skip</button>
        </div>
      )}

      {/* Sticky Bottom Actions */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface)', padding: '1rem', borderTop: '1px solid var(--border)', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 40 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Button variant="primary" fullWidth size="lg" onClick={finishWorkout}>
            Finish Workout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActiveSession;
