import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) {
        setProfileLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/users/${user._id}`);
        setProfile(response.data);
      } catch (error) {
        setProfileError(error.response?.data?.message || 'Failed to load profile data.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user?._id]);

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

        {profileLoading && <p className="dashboard-subtext">Loading your profile from API...</p>}
        {profileError && <div className="alert alert-error">{profileError}</div>}

        <div className="dashboard-card">
          <p className="dashboard-item">
            <strong>Name:</strong> {profile?.name || user?.name || 'N/A'}
          </p>
          <p className="dashboard-item">
            <strong>Email:</strong> {profile?.email || user?.email || 'N/A'}
          </p>
          <p className="dashboard-item">
            <strong>User ID:</strong> {profile?._id || user?._id || 'N/A'}
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
