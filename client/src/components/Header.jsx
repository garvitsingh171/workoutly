import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <Link to="/" style={styles.link}>Workoutly</Link>
      </div>
      <nav style={styles.nav}>
        {!isAuthenticated() && (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}

        {isAuthenticated() && (
          <>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            <span style={styles.userText}>Hi, {user?.name || 'User'}</span>
            <button style={styles.logoutBtn} onClick={logout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#333',
    color: '#fff',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  nav: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
  },
  userText: {
    color: '#ddd',
    fontSize: '0.95rem',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #aaa',
    color: '#fff',
    borderRadius: '4px',
    padding: '0.4rem 0.7rem',
    cursor: 'pointer',
  },
};

export default Header;
