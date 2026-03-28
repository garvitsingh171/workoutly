import { useState } from 'react';

const ConnectionTest = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const frontendUrl = window.location.origin;

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Using relative URL because of Vite proxy
      const response = await fetch('/api/health');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMessage(data.message);
      
    } catch (err) {
      setError('Failed to connect to server: ' + err.message);
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
        <p><strong>Frontend Origin:</strong> {frontendUrl}</p>
        <p><strong>Using:</strong> Vite Proxy + Express CORS</p>
      </div>
    </div>
  );
};

export default ConnectionTest;