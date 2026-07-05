import Badge from '../ui/Badge';
import Card from '../ui/Card';

const clampPercent = (value) => Math.min(100, Math.max(0, value));

const buildAchievements = (summary, goalSummary) => {
  const totalWorkouts = summary.totalSessions || 0;
  const currentStreak = summary.currentStreakDays || goalSummary?.currentStreakDays || 0;
  const weeklyTarget = goalSummary?.weeklyWorkoutTarget || 3;
  const sessionsThisWeek = goalSummary?.sessionsThisWeek ?? summary.sessionsThisWeek ?? 0;

  return [
    {
      title: 'First Workout',
      shortLabel: '1',
      target: 1,
      current: totalWorkouts,
      detail: 'Complete one workout session.',
    },
    {
      title: '3 Day Streak',
      shortLabel: '3',
      target: 3,
      current: currentStreak,
      detail: 'Train three days in a row.',
    },
    {
      title: '10 Workouts Completed',
      shortLabel: '10',
      target: 10,
      current: totalWorkouts,
      detail: 'Finish ten workout sessions.',
    },
    {
      title: 'Consistency Champ',
      shortLabel: 'C',
      target: weeklyTarget,
      current: sessionsThisWeek,
      detail: 'Hit this week\'s workout target.',
    },
  ].map((achievement) => ({
    ...achievement,
    unlocked: achievement.current >= achievement.target,
    progressPercent: clampPercent((achievement.current / achievement.target) * 100),
  }));
};

const AchievementSection = ({ summary, goalSummary, loading }) => {
  const achievements = buildAchievements(summary, goalSummary);
  const currentStreak = summary.currentStreakDays || goalSummary?.currentStreakDays || 0;
  const nextAchievement = achievements.find((achievement) => !achievement.unlocked);
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <section className="dashboard-section" aria-labelledby="achievements-title">
      <div className="dashboard-section__header">
        <div>
          <Badge color="accent">Streaks</Badge>
          <h2 id="achievements-title">Achievements</h2>
        </div>
        <div className="streak-pill">
          <span>Current streak</span>
          <strong>{currentStreak} days</strong>
        </div>
      </div>

      <Card className="achievements-panel">
        <Card.Body>
          {loading ? (
            <div className="inline-state" role="status" aria-live="polite">
              <div className="loading-spinner loading-spinner--sm" aria-hidden="true"></div>
              <span>Loading achievements...</span>
            </div>
          ) : (
            <>
              <div className="achievement-progress">
                <div>
                  <p className="achievement-progress__label">Badge progress</p>
                  <h3>{unlockedCount} of {achievements.length} unlocked</h3>
                  <p>
                    {nextAchievement
                      ? `${nextAchievement.title}: ${Math.min(nextAchievement.current, nextAchievement.target)} / ${nextAchievement.target}`
                      : 'Every current badge is unlocked.'}
                  </p>
                </div>
                <div className="achievement-progress__bar" aria-hidden="true">
                  <span
                    style={{
                      width: `${nextAchievement ? nextAchievement.progressPercent : 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="achievement-grid">
                {achievements.map((achievement) => (
                  <article
                    key={achievement.title}
                    className={`achievement-card ${achievement.unlocked ? 'achievement-card--unlocked' : 'achievement-card--locked'}`.trim()}
                  >
                    <div className="achievement-card__medal" aria-hidden="true">
                      {achievement.shortLabel}
                    </div>
                    <div>
                      <div className="achievement-card__topline">
                        <h4>{achievement.title}</h4>
                        <Badge color={achievement.unlocked ? 'success' : 'neutral'}>
                          {achievement.unlocked ? 'Unlocked' : 'Locked'}
                        </Badge>
                      </div>
                      <p>{achievement.detail}</p>
                      <div className="achievement-card__bar" aria-label={`${achievement.title} progress ${Math.round(achievement.progressPercent)}%`}>
                        <span style={{ width: `${achievement.progressPercent}%` }} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </section>
  );
};

export default AchievementSection;
