/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const AuthContext = createContext(null);

const getInitialAuthState = () => {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedToken || !storedUser) {
    return { user: null, token: null };
  }

  try {
    return {
      token: storedToken,
      user: JSON.parse(storedUser),
    };
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { user: null, token: null };
  }
};

export const AuthProvider = ({ children }) => {
  const initialAuthState = useMemo(() => getInitialAuthState(), []);
  const [user, setUser] = useState(initialAuthState.user);
  const [token, setToken] = useState(initialAuthState.token);
  const [loading] = useState(false);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem(TOKEN_KEY, userToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const isAuthenticated = Boolean(token && user);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
    }),
    [user, token, loading, isAuthenticated]
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