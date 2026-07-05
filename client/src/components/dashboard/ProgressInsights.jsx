import Badge from '../ui/Badge';
import Card from '../ui/Card';

const demoWeeklyActivity = [
  { label: 'Mon', sessionCount: 1, totalVolume: 2200 },
  { label: 'Tue', sessionCount: 0, totalVolume: 0 },
  { label: 'Wed', sessionCount: 2, totalVolume: 4100 },
  { label: 'Thu', sessionCount: 1, totalVolume: 1800 },
  { label: 'Fri', sessionCount: 0, totalVolume: 0 },
  { label: 'Sat', sessionCount: 1, totalVolume: 2600 },
  { label: 'Sun', sessionCount: 1, totalVolume: 2100 },
];

const demoRecentSession = {
  workoutName: 'Lower Strength',
  totalCompletedSets: 14,
  totalVolume: 5200,
};

const formatDate = (value) => {
  if (!value) return 'No date yet';

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const formatNumber = (value) => Math.round(Number(value) || 0).toLocaleString();

const ProgressInsights = ({
  loading,
  isDemo,
  totalWorkouts,
  weeklyActivity,
  streakDays,
  mostTrainedGroup,
  recentSession,
}) => {
  const chartData = isDemo ? demoWeeklyActivity : weeklyActivity;
  const chartMax = Math.max(...chartData.map((day) => day.sessionCount), 1);
  const displayedRecentSession = isDemo ? demoRecentSession : recentSession;
  const displayedMostTrainedGroup = isDemo
    ? { label: 'Legs', detail: 'Demo focus area' }
    : mostTrainedGroup;

  if (loading) {
    return (
      <Card className="insights-loading-card">
        <Card.Body>
          <div className="inline-state" role="status" aria-live="polite">
            <div className="loading-spinner loading-spinner--sm" aria-hidden="true"></div>
            <span>Loading progress insights...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <section className="dashboard-section" aria-labelledby="progress-insights-title">
      <div className="dashboard-section__header">
        <div>
          <Badge color={isDemo ? 'warning' : 'primary'}>{isDemo ? 'Demo Insights' : 'Progress Insights'}</Badge>
          <h2 id="progress-insights-title">Progress Insights</h2>
        </div>
      </div>

      <div className="insights-grid">
        <Card className="insight-card insight-card--primary">
          <Card.Body>
            <p className="insight-card__label">Total workouts</p>
            <strong className="insight-card__value">{isDemo ? 18 : totalWorkouts}</strong>
            <span className="insight-card__hint">Completed sessions</span>
          </Card.Body>
        </Card>

        <Card className="insight-card insight-card--chart">
          <Card.Body>
            <div className="insight-card__topline">
              <div>
                <p className="insight-card__label">Weekly activity</p>
                <strong className="insight-card__headline">
                  {chartData.reduce((sum, day) => sum + day.sessionCount, 0)} sessions
                </strong>
              </div>
              <Badge color="accent">7 days</Badge>
            </div>
            <div className="weekly-chart" aria-label="Weekly workout activity">
              {chartData.map((day) => {
                const height = day.sessionCount > 0 ? Math.max(18, (day.sessionCount / chartMax) * 100) : 8;

                return (
                  <div key={day.dateKey || day.label} className="weekly-chart__day">
                    <div className="weekly-chart__bar-wrap" title={`${day.sessionCount} sessions`}>
                      <span
                        className="weekly-chart__bar"
                        style={{ height: `${height}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="weekly-chart__label">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </Card.Body>
        </Card>

        <Card className="insight-card">
          <Card.Body>
            <p className="insight-card__label">Current streak</p>
            <strong className="insight-card__value">{isDemo ? 4 : streakDays}</strong>
            <span className="insight-card__hint">Training days</span>
          </Card.Body>
        </Card>

        <Card className="insight-card">
          <Card.Body>
            <p className="insight-card__label">Most trained</p>
            <strong className="insight-card__headline">
              {displayedMostTrainedGroup?.label || 'No focus yet'}
            </strong>
            <span className="insight-card__hint">
              {displayedMostTrainedGroup?.detail || 'Complete sessions to unlock this'}
            </span>
          </Card.Body>
        </Card>

        <Card className="insight-card insight-card--recent">
          <Card.Body>
            <p className="insight-card__label">Recent workout</p>
            {displayedRecentSession ? (
              <>
                <strong className="insight-card__headline">{displayedRecentSession.workoutName}</strong>
                <div className="recent-summary">
                  <span>{formatDate(displayedRecentSession.completedAt)}</span>
                  <span>{displayedRecentSession.totalCompletedSets || 0} sets</span>
                  <span>{formatNumber(displayedRecentSession.totalVolume)} volume</span>
                </div>
              </>
            ) : (
              <>
                <strong className="insight-card__headline">No sessions yet</strong>
                <span className="insight-card__hint">Start a routine to build history</span>
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    </section>
  );
};

export default ProgressInsights;
