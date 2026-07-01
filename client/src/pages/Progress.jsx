import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

const Progress = () => {
  const [exerciseName, setExerciseName] = useState('');
  const [searchedExercise, setSearchedExercise] = useState('');
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const summary = useMemo(() => {
    if (progress.length === 0) {
      return {
        bestWeight: 0,
        bestReps: 0,
        highestVolume: 0,
      };
    }

    return progress.reduce(
      (totals, session) => ({
        bestWeight: Math.max(totals.bestWeight, session.bestWeight || 0),
        bestReps: Math.max(totals.bestReps, session.bestReps || 0),
        highestVolume: Math.max(totals.highestVolume, session.totalVolume || 0),
      }),
      {
        bestWeight: 0,
        bestReps: 0,
        highestVolume: 0,
      }
    );
  }, [progress]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedExerciseName = exerciseName.trim();

    if (!trimmedExerciseName) {
      setError('Enter an exercise name to view progress.');
      return;
    }

    setLoading(true);
    setError('');
    setSearchedExercise(trimmedExerciseName);

    try {
      const response = await api.get(
        `/api/sessions/progress?exerciseName=${encodeURIComponent(trimmedExerciseName)}`
      );
      setProgress(response.data.data || []);
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Failed to load progress.');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const maxVolume = Math.max(...progress.map((session) => session.totalVolume || 0), 0);

  return (
    <section className="page page-dashboard">
      <div className="dashboard-wrap">
        <header className="page-heading">
          <Badge color="primary" className="page-heading__eyebrow">Progress</Badge>
          <h1 className="page-heading__title">Progress</h1>
          <p className="page-heading__text">
            Search one exercise to review completed session history, best sets, and volume.
          </p>
        </header>

        <Card className="feature-panel">
          <Card.Body>
            <form className="progress-search" onSubmit={handleSubmit}>
              <div className="ui-input-group progress-search__field">
                <label htmlFor="progress-exercise" className="ui-label">Exercise Name</label>
                <input
                  id="progress-exercise"
                  className="ui-input"
                  type="text"
                  value={exerciseName}
                  onChange={(event) => setExerciseName(event.target.value)}
                  placeholder="Bench Press"
                />
              </div>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Loading...' : 'View Progress'}
              </Button>
            </form>
          </Card.Body>
        </Card>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <Card className="empty-state">
            <Card.Body>
              <div className="loading-spinner" aria-hidden="true"></div>
              <p className="dashboard-subtext">Loading progress...</p>
            </Card.Body>
          </Card>
        ) : searchedExercise && progress.length === 0 ? (
          <Card className="empty-state">
            <Card.Body>
              <div className="empty-state__mark" aria-hidden="true">P</div>
              <h3>No progress data yet</h3>
              <p>Finish a workout session with {searchedExercise} to start tracking progress.</p>
            </Card.Body>
          </Card>
        ) : progress.length > 0 ? (
          <>
            <div className="stats-grid" aria-label="Exercise progress summary">
              <article className="stat-card">
                <p className="stat-card__label">Sessions Found</p>
                <p className="stat-card__value">{progress.length}</p>
                <p className="stat-card__hint">{searchedExercise}</p>
              </article>
              <article className="stat-card">
                <p className="stat-card__label">Best Weight</p>
                <p className="stat-card__value">{summary.bestWeight}</p>
                <p className="stat-card__hint">Highest completed set weight</p>
              </article>
              <article className="stat-card">
                <p className="stat-card__label">Best Reps</p>
                <p className="stat-card__value">{summary.bestReps}</p>
                <p className="stat-card__hint">Highest completed set reps</p>
              </article>
              <article className="stat-card">
                <p className="stat-card__label">Highest Volume</p>
                <p className="stat-card__value">{summary.highestVolume}</p>
                <p className="stat-card__hint">Best single session volume</p>
              </article>
            </div>

            <Card>
              <Card.Body>
                <h3 className="form-card__title">Progress Table</h3>
                <div className="table-wrap">
                  <table className="basic-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Workout</th>
                        <th>Best Weight</th>
                        <th>Best Reps</th>
                        <th>Completed Sets</th>
                        <th>Total Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progress.map((session) => (
                        <tr key={session.sessionId}>
                          <td>{formatDate(session.completedAt)}</td>
                          <td>{session.workoutName}</td>
                          <td>{session.bestWeight}</td>
                          <td>{session.bestReps}</td>
                          <td>{session.completedSets}</td>
                          <td>
                            <div className="volume-cell">
                              <span>{session.totalVolume}</span>
                              <div className="volume-bar" aria-hidden="true">
                                <span
                                  style={{
                                    width: `${maxVolume ? (session.totalVolume / maxVolume) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default Progress;
