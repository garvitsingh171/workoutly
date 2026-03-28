import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="page-state">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="page page-dashboard">
      <div className="dashboard-wrap">
        <h2 className="dashboard-title">Dashboard</h2>
        <p className="dashboard-subtext">You are logged in successfully.</p>

        <div className="dashboard-card">
          <p className="dashboard-item">
            <strong>Name:</strong> {user?.name || 'N/A'}
          </p>
          <p className="dashboard-item">
            <strong>Email:</strong> {user?.email || 'N/A'}
          </p>
          <p className="dashboard-item">
            <strong>User ID:</strong> {user?._id || 'N/A'}
          </p>
        </div>

        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>
    </section>
  );
};

export default Dashboard;
