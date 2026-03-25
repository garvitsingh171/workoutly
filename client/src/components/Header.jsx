import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <Link to="/" style={styles.link}>Workoutly</Link>
      </div>
      <nav style={styles.nav}>
        <Link to="/login" style={styles.link}>Login</Link>
        <Link to="/register" style={styles.link}>Register</Link>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
      </nav>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    backgroundColor: '#333',
    color: '#fff'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  nav: {
    display: 'flex',
    gap: '1rem'
  },
  link: {
    color: '#fff',
    textDecoration: 'none'
  }
};

export default Header;
