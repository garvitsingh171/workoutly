import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import ThemeToggle from './common/ThemeToggle';

const authenticatedNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/history', label: 'History' },
  { to: '/goals', label: 'Goals' },
  { to: '/progress', label: 'Progress' },
  { to: '/records', label: 'Records' },
  { to: '/exercises', label: 'Exercises' },
];

const getNavLinkClassName = ({ isActive }) =>
  `site-header__link ${isActive ? 'site-header__link--active' : ''}`.trim();

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const firstName = user?.name?.split(' ')[0];
  const userInitial = firstName?.charAt(0)?.toUpperCase();
  const authenticated = isAuthenticated();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__logo-link">
          <img
            src="/workoutly.png"
            alt="Workoutly logo"
            className="site-header__logo-img"
            width="40"
            height="40"
          />
          <span className="site-header__brand-text">Workoutly</span>
        </Link>

        <nav className="site-header__nav" aria-label="Primary navigation">
          {authenticated ? (
            <>
              <div className="site-header__primary-links">
                {authenticatedNavItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className={getNavLinkClassName}>
                    {item.label}
                  </NavLink>
                ))}
              </div>

              <div className="site-header__actions">
                {firstName && (
                  <span className="site-header__user-text">
                    {userInitial && <span className="site-header__user-avatar" aria-hidden="true">{userInitial}</span>}
                    <span>Hi, {firstName}</span>
                  </span>
                )}
                <ThemeToggle />
                <button onClick={logout} className="site-header__logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="site-header__actions site-header__actions--guest">
              <NavLink to="/login" className={getNavLinkClassName}>
                Login
              </NavLink>
              <ThemeToggle />
              <Button as={Link} to="/register" variant="primary" size="sm">
                Register
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
