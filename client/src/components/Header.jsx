import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="site-header__logo-wrap">
        <Link to="/" className="site-header__logo-link">Workoutly</Link>
      </div>
      <nav className="site-header__nav">
        {!isAuthenticated() && (
          <>
            <Link to="/login" className="site-header__link">Login</Link>
            <Link to="/register" className="site-header__link">Register</Link>
          </>
        )}

        {isAuthenticated() && (
          <>
            <Link to="/dashboard" className="site-header__link">Dashboard</Link>
            <span className="site-header__user-text">Hi, {user?.name || 'User'}</span>
            <button className="site-header__logout-btn" onClick={logout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
