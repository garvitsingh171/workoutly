import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="site-header__logo-wrap">
        <Link to="/" className="site-header__logo-link">
          <span style={{ fontSize: '1.8rem', marginRight: '0.2rem' }}>🔥</span> Workoutly
        </Link>
      </div>

      <nav className="site-header__nav">
        {isAuthenticated() ? (
          <>
            <Link to="/dashboard" className="site-header__link">Dashboard</Link>
            <Link to="/workouts" className="site-header__link">My Workouts</Link>
            <button onClick={logout} className="site-header__logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="site-header__link">Log in</Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm" style={{ borderRadius: '999px' }}>Get Started</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
