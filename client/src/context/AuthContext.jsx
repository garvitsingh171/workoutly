/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const AuthContext = createContext(null);

const parseJwtPayload = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const jsonPayload = atob(padded);

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedToken || !storedUser) {
        setLoading(false);
        return;
      }

      if (!isTokenExpired(storedToken)) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {
          clearStoredAuth();
        } finally {
          setLoading(false);
        }

        return;
      }

      try {
        const response = await api.post('/api/auth/refresh');
        const { token: refreshedToken, user: refreshedUser } = response.data;

        if (refreshedToken && refreshedUser) {
          setToken(refreshedToken);
          setUser(refreshedUser);
          localStorage.setItem(TOKEN_KEY, refreshedToken);
          localStorage.setItem(USER_KEY, JSON.stringify(refreshedUser));
        } else {
          clearStoredAuth();
        }
      } catch {
        clearStoredAuth();
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Local logout should still happen even if the server is unreachable.
    }

    setUser(null);
    setToken(null);
    clearStoredAuth();
    navigate('/login');
  }, [navigate]);

  const login = useCallback((userData, userToken) => {
    if (isTokenExpired(userToken)) {
      logout();
      return { success: false, message: 'Session token is expired. Please login again.' };
    }

    setUser(userData);
    setToken(userToken);
    localStorage.setItem(TOKEN_KEY, userToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return { success: true };
  }, [logout]);

  const isAuthenticated = useCallback(() => {
    return Boolean(token && user);
  }, [token, user]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
      isTokenExpired,
    }),
    [user, token, loading, login, logout, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
