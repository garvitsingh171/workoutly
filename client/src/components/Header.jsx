import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [openMenuPath, setOpenMenuPath] = useState(null);
  const firstName = user?.name?.split(' ')[0];
  const userInitial = firstName?.charAt(0)?.toUpperCase();
  const authenticated = isAuthenticated();
  const isMenuOpen = openMenuPath === location.pathname;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenuPath(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    setOpenMenuPath(null);
    logout();
  };

  const handleMenuToggle = () => {
    setOpenMenuPath((currentPath) => (currentPath === location.pathname ? null : location.pathname));
  };

  return (
    <header className={`site-header ${isMenuOpen ? 'site-header--menu-open' : ''}`.trim()}>
      <div className="site-header__inner">
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

        <button
          type="button"
          className="site-header__menu-btn"
          onClick={handleMenuToggle}
          aria-expanded={isMenuOpen}
          aria-controls="site-primary-nav"
        >
          <span className="sr-only">{isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}</span>
          <span className="site-header__menu-icon" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <nav
          id="site-primary-nav"
          className={`site-header__nav ${isMenuOpen ? 'site-header__nav--open' : ''}`.trim()}
          aria-label="Primary navigation"
        >
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
                <button onClick={handleLogout} className="site-header__logout-btn">
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
