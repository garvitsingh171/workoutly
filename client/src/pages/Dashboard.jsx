import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Dashboard</h2>
      <p style={styles.subtext}>You are logged in successfully.</p>

      <div style={styles.card}>
        <p style={styles.item}>
          <strong>Name:</strong> {user?.name || 'N/A'}
        </p>
        <p style={styles.item}>
          <strong>Email:</strong> {user?.email || 'N/A'}
        </p>
        <p style={styles.item}>
          <strong>User ID:</strong> {user?._id || 'N/A'}
        </p>
      </div>

      <button style={styles.logoutButton} onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center',
  },
  heading: {
    marginBottom: '0.5rem',
  },
  subtext: {
    color: '#666',
    marginBottom: '1.5rem',
  },
  card: {
    maxWidth: '420px',
    margin: '0 auto 1.5rem',
    padding: '1rem',
    border: '1px solid #e2e2e2',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    textAlign: 'left',
  },
  item: {
    margin: '0.5rem 0',
  },
  logoutButton: {
    padding: '0.75rem 1.25rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
  },
};

export default Dashboard;
