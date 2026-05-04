import { useState } from 'react';
import api from '../../services/api';

const ConnectionTest = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const frontendUrl = window.location.origin;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.get('/api/health', { timeout: 30000 });
      const data = response.data;
      setMessage(data.message);
      
    } catch (err) {
      const isNetworkError = err?.message === 'Network Error';
      const isTimeoutError = err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '');
      const details = err.response?.data?.message || err.message;
      const hint = isTimeoutError
        ? ' The backend may be cold-starting on Render. Try again in a few seconds or check the Render service status.'
        : isNetworkError
          ? ' Check API URL and backend CORS allowed origins in Render.'
          : '';
      setError('Failed to connect to server: ' + details + hint);
      console.error('Connection test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connection-card">
      <h3 className="connection-title">Backend Connection Test</h3>
      
      <button 
        onClick={testConnection} 
        disabled={loading}
        className={loading ? 'btn btn-primary btn-disabled' : 'btn btn-primary'}
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>

      {message && (
        <div className="alert alert-success">
          Success: {message}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          Error: {error}
        </div>
      )}

      <div className="connection-info">
        <p><strong>API Path:</strong> /api/health (proxied in development)</p>
        <p><strong>API Base URL:</strong> {apiBaseUrl}</p>
        <p><strong>Frontend Origin:</strong> {frontendUrl}</p>
        <p><strong>Using:</strong> Vite Proxy + Express CORS</p>
      </div>
    </div>
  );
};

export default ConnectionTest;