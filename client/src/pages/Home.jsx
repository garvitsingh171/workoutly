import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const Home = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-state">
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="page page-home">
      <section className="home-hero">
        <div className="hero">
          <Badge color="accent" className="hero-kicker">Fitness command center</Badge>
          <h1>
            Train with focus. Track with <span>Workoutly</span>.
          </h1>
          <p className="hero-copy">
            Build reusable routines, log working sets during a live session, and keep your workouts organized in one clean dashboard.
          </p>
          <div className="hero-actions">
            <Button as={Link} to="/register" variant="primary" size="lg">
              Start Tracking Free
            </Button>
            <Button as={Link} to="/login" variant="ghost" size="lg">
              I already have an account
            </Button>
          </div>
          <div className="hero-proof" aria-label="Workoutly core features">
            <span>Routine templates</span>
            <span>Live set logging</span>
            <span>Cover images</span>
          </div>
        </div>

        <aside className="hero-preview" aria-label="Workoutly session preview">
          <div className="hero-preview__topbar">
            <div className="hero-preview__dots" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <Badge color="primary">Active</Badge>
          </div>
          <div className="hero-preview__body">
            <h2 className="hero-preview__title">Upper Strength</h2>
            <p className="hero-preview__meta">45 min routine • Intermediate • 4 exercises</p>
            <div className="hero-preview__set">
              <div>
                <strong>Bench Press</strong>
                <span>3 sets x 8 reps</span>
              </div>
              <span className="hero-preview__status">Ready</span>
            </div>
            <div className="hero-preview__set">
              <div>
                <strong>Shoulder Press</strong>
                <span>3 sets x 10 reps</span>
              </div>
              <span className="hero-preview__status">Next</span>
            </div>
            <div className="hero-preview__set">
              <div>
                <strong>Rest Timer</strong>
                <span>Premium 90 second countdown</span>
              </div>
              <span className="hero-preview__status">1:30</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="features-section">
        <div className="features-header">
          <h2>Everything you need before, during, and after a workout.</h2>
          <p>Workoutly stays practical: create routines, upload a cover, start a session, and manage templates without clutter.</p>
        </div>
        <div className="features">
          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">01</div>
            <h3 className="feature-title">Reusable Routine Templates</h3>
            <p className="feature-desc">Save exercises, sets, reps, duration, difficulty, and notes so your next session starts fast.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">02</div>
            <h3 className="feature-title">Mobile Live Sessions</h3>
            <p className="feature-desc">Log weight and reps set by set, mark work complete, and use the built-in rest timer on the gym floor.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">03</div>
            <h3 className="feature-title">Clean Workout Dashboard</h3>
            <p className="feature-desc">Review your current routines, difficulty, exercise count, duration, and actions from one polished view.</p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default Home;
