import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const loginPayload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.message || 'Login failed. Please try again.');
        return;
      }

      const loginResult = login(data.user, data.token);

      if (!loginResult.success) {
        setApiError(loginResult.message || 'Unable to login.');
        return;
      }

      navigate('/dashboard');
    } catch {
      setApiError('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={titleStyle}>Welcome Back</h1>
        <p style={subtitleStyle}>Login to continue your fitness journey</p>

        {apiError && <div style={errorMessageStyle}>{apiError}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              style={errors.email ? inputErrorStyle : inputStyle}
              disabled={isLoading}
            />
            {errors.email && <span style={errorTextStyle}>{errors.email}</span>}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={errors.password ? inputErrorStyle : inputStyle}
              disabled={isLoading}
            />
            {errors.password && <span style={errorTextStyle}>{errors.password}</span>}
          </div>

          <button
            type="submit"
            style={isLoading ? buttonDisabledStyle : buttonStyle}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={linkTextStyle}>
          New to Workoutly?{' '}
          <Link to="/register" style={linkStyle}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

const containerStyle = {
  minHeight: '80vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
  backgroundColor: '#f8f9fa',
};

const formContainerStyle = {
  maxWidth: '420px',
  width: '100%',
  padding: '2.5rem',
  backgroundColor: 'white',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const titleStyle = {
  textAlign: 'center',
  marginBottom: '0.5rem',
  color: '#333',
  fontSize: '2rem',
};

const subtitleStyle = {
  textAlign: 'center',
  color: '#666',
  marginBottom: '2rem',
  fontSize: '0.95rem',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle = {
  marginBottom: '0.5rem',
  fontWeight: '500',
  color: '#333',
  fontSize: '0.9rem',
};

const inputStyle = {
  padding: '0.75rem',
  fontSize: '1rem',
  border: '1px solid #ddd',
  borderRadius: '5px',
};

const inputErrorStyle = {
  ...inputStyle,
  borderColor: '#dc3545',
};

const errorTextStyle = {
  color: '#dc3545',
  fontSize: '0.85rem',
  marginTop: '0.25rem',
};

const buttonStyle = {
  padding: '0.875rem',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '0.25rem',
};

const buttonDisabledStyle = {
  ...buttonStyle,
  backgroundColor: '#6c757d',
  cursor: 'not-allowed',
};

const errorMessageStyle = {
  padding: '0.9rem',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  borderRadius: '5px',
  marginBottom: '1rem',
  border: '1px solid #f5c6cb',
  fontSize: '0.95rem',
};

const linkTextStyle = {
  textAlign: 'center',
  marginTop: '1.5rem',
  color: '#666',
};

const linkStyle = {
  color: '#007bff',
  textDecoration: 'none',
  fontWeight: '500',
};

export default Login;
