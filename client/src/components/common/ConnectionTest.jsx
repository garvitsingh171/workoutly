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
    <div style={containerStyle}>
      <h3>Backend Connection Test</h3>
      
      <button 
        onClick={testConnection} 
        disabled={loading}
        style={buttonStyle}
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>

      {message && (
        <div style={successStyle}>
          ✅ Success: {message}
        </div>
      )}

      {error && (
        <div style={errorStyle}>
          ❌ Error: {error}
        </div>
      )}

      <div style={infoStyle}>
        <p><strong>API Path:</strong> /api/health (proxied in development)</p>
        <p><strong>Frontend Origin:</strong> {frontendUrl}</p>
        <p><strong>Using:</strong> Vite Proxy + Express CORS</p>
      </div>
    </div>
  );
};

const containerStyle = {
  padding: '2rem',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  margin: '2rem 0',
};

const buttonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1rem',
  cursor: 'pointer',
  marginTop: '1rem',
};

const successStyle = {
  marginTop: '1rem',
  padding: '1rem',
  backgroundColor: '#d4edda',
  color: '#155724',
  borderRadius: '5px',
  border: '1px solid #c3e6cb',
};

const errorStyle = {
  marginTop: '1rem',
  padding: '1rem',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  borderRadius: '5px',
  border: '1px solid #f5c6cb',
};

const infoStyle = {
  marginTop: '1.5rem',
  padding: '1rem',
  backgroundColor: 'white',
  borderRadius: '5px',
  fontSize: '0.9rem',
};

export default ConnectionTest;