import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import ThemeToggle from './common/ThemeToggle';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const firstName = user?.name?.split(' ')[0];

  return (
    <header className="site-header">
      <div className="site-header__logo-wrap">
        <Link to="/" className="site-header__logo-link">
          <span className="site-header__logo-mark" aria-hidden="true">W</span>
          <span>Workoutly</span>
        </Link>
      </div>

      <nav className="site-header__nav">
        {isAuthenticated() ? (
          <>
            <Link to="/dashboard" className="site-header__link">Dashboard</Link>
            {firstName && <span className="site-header__user-text">Hi, {firstName}</span>}
            <ThemeToggle />
            <button onClick={logout} className="site-header__logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="site-header__link">Login</Link>
            <ThemeToggle />
            <Button as={Link} to="/register" variant="primary" size="sm">
              Register
            </Button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
