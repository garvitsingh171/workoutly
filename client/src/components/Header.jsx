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
  `site-header__app-link ${isActive ? 'site-header__app-link--active' : ''}`.trim();

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const firstName = user?.name?.split(' ')[0];
  const userInitial = firstName?.charAt(0)?.toUpperCase();
  const authenticated = isAuthenticated();

  return (
    <header className="site-header">
      <div className="site-header__topbar">
        <Link to="/" className="site-header__logo-link">
          <img
            src="/workoutly.png"
            alt=""
            aria-hidden="true"
            className="site-header__logo-img"
            width="44"
            height="44"
          />
          <span className="site-header__brand">
            <span className="site-header__brand-text">Workoutly</span>
            <span className="site-header__brand-tagline">Train. Log. Progress.</span>
          </span>
        </Link>

        <div className={`site-header__actions ${authenticated ? '' : 'site-header__actions--guest'}`.trim()}>
          <ThemeToggle />
          {authenticated ? (
            <>
              {firstName && (
                <span className="site-header__user-text">
                  {userInitial && <span className="site-header__user-avatar" aria-hidden="true">{userInitial}</span>}
                  <span>Hi, {firstName}</span>
                </span>
              )}
              <button type="button" onClick={logout} className="site-header__logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="site-header__auth-link">
                Login
              </NavLink>
              <Button as={Link} to="/register" variant="primary" size="sm">
                Register
              </Button>
            </>
          )}
        </div>
      </div>

      {authenticated && (
        <nav id="site-primary-nav" className="site-header__app-nav" aria-label="Primary navigation">
          <div className="site-header__app-nav-track">
            {authenticatedNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={getNavLinkClassName}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
