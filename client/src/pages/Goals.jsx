import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api, { getErrorMessage } from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const defaultSummary = {
  weeklyWorkoutTarget: 3,
  sessionsThisWeek: 0,
  remainingThisWeek: 3,
  weeklyProgressPercent: 0,
  currentStreakDays: 0,
  longestStreakDays: 0,
};

const Goals = () => {
  const [summary, setSummary] = useState(defaultSummary);
  const [targetInput, setTargetInput] = useState('3');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [targetError, setTargetError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/goals/summary');
      const nextSummary = {
        ...defaultSummary,
        ...(response.data.data || {}),
      };
      setSummary(nextSummary);
      setTargetInput(String(nextSummary.weeklyWorkoutTarget || 3));
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Failed to load goals.');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setTargetError('');
    setSuccess('');

    const nextTarget = Number(targetInput);
    if (!Number.isInteger(nextTarget) || nextTarget < 1 || nextTarget > 14) {
      setTargetError('Weekly target must be a whole number between 1 and 14.');
      return;
    }

    setSaving(true);

    try {
      await api.put('/api/goals/current', {
        weeklyWorkoutTarget: nextTarget,
      });
      await fetchSummary();
      setSuccess('Weekly target updated.');
      toast.success('Weekly target updated.');
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Failed to update weekly target.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-state">
        <div className="loading-spinner" aria-hidden="true"></div>
        <p>Loading goals...</p>
      </div>
    );
  }

  return (
    <section className="page page-dashboard">
      <div className="dashboard-wrap">
        <header className="page-heading">
          <Badge color="primary" className="page-heading__eyebrow">Goals</Badge>
          <h1 className="page-heading__title">Weekly Goals</h1>
          <p className="page-heading__text">
            Set a simple weekly workout target and track your training consistency.
          </p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="stats-grid" aria-label="Weekly goal summary">
          <article className="stat-card">
            <p className="stat-card__label">Weekly target</p>
            <p className="stat-card__value">{summary.weeklyWorkoutTarget}</p>
            <p className="stat-card__hint">Workouts planned</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">This week</p>
            <p className="stat-card__value">{summary.sessionsThisWeek}</p>
            <p className="stat-card__hint">Completed sessions</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Remaining</p>
            <p className="stat-card__value">{summary.remainingThisWeek}</p>
            <p className="stat-card__hint">To reach your target</p>
          </article>
          <article className="stat-card">
            <p className="stat-card__label">Current streak</p>
            <p className="stat-card__value">{summary.currentStreakDays}</p>
            <p className="stat-card__hint">Training days</p>
          </article>
        </div>

        <Card className="feature-panel">
          <Card.Body>
            <h3 className="form-card__title">Weekly Progress</h3>
            <div className="goal-progress">
              <div className="goal-progress__bar" aria-hidden="true">
                <span style={{ width: `${summary.weeklyProgressPercent || 0}%` }} />
              </div>
              <p className="dashboard-subtext">
                {summary.sessionsThisWeek} / {summary.weeklyWorkoutTarget} workouts complete · {summary.weeklyProgressPercent || 0}%
              </p>
              <p className="dashboard-subtext">
                Longest streak: {summary.longestStreakDays || 0} days
              </p>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <form className="goal-form" onSubmit={handleSubmit}>
              <div className="ui-input-group goal-form__field">
                <label htmlFor="weekly-target" className="ui-label">Weekly Workout Target</label>
                <input
                  id="weekly-target"
                  className={`ui-input ${targetError ? 'ui-input--error' : ''}`.trim()}
                  type="number"
                  min="1"
                  max="14"
                  step="1"
                  value={targetInput}
                  onChange={(event) => {
                    setTargetInput(event.target.value);
                    setTargetError('');
                    setSuccess('');
                  }}
                  aria-invalid={targetError ? 'true' : undefined}
                  aria-describedby={targetError ? 'weekly-target-error' : undefined}
                  disabled={saving}
                />
                {targetError && (
                  <span id="weekly-target-error" className="ui-error-text" role="alert">
                    {targetError}
                  </span>
                )}
              </div>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving...' : 'Update Target'}
              </Button>
            </form>
          </Card.Body>
        </Card>
      </div>
    </section>
  );
};

export default Goals;
