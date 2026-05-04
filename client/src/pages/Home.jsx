import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

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
    <div className="page" style={{ padding: 0 }}>
      {/* Hero Section */}
      <section className="hero">
        <h1>
          Push Your Limits with <span>Workoutly</span>
        </h1>
        <p>
          The simple, intuitive, and powerful way to track your fitness journey.
          Log your exercises, analyze your progress, and hit those PRs.
        </p>
        <div className="hero-actions">
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">Start Tracking Free</Button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="lg">I already have an account</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3 className="feature-title">Log Workouts</h3>
          <p className="feature-desc">Easily log sets, reps, and weights for every exercise you do in the gym or at home.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📈</div>
          <h3 className="feature-title">Track Progress</h3>
          <p className="feature-desc">Visualize your strength gains over time and stay motivated with detailed workout histories.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3 className="feature-title">Hit Your Goals</h3>
          <p className="feature-desc">Set personal records, stay consistent, and watch your fitness dreams become reality.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
