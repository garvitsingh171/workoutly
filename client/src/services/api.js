import axios from 'axios';

export const AUTH_CLEARED_EVENT = 'workoutly-auth-cleared';

export const getErrorMessage = (error, fallbackMessage = 'Something went wrong. Please try again.') => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 30000,
  withCredentials: true,
});

const clearAuthAndNotify = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event(AUTH_CLEARED_EVENT));
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/users/register',
      '/api/auth/refresh',
      '/api/auth/logout',
    ].includes(requestUrl);

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.post('/api/auth/refresh');
        const { token, user } = refreshResponse.data;

        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;

          return api(originalRequest);
        }
      } catch {
        // Fall through to auth cleanup below.
      }
    }

    if (error.response?.status === 401 && !isAuthEndpoint) {
      clearAuthAndNotify();

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
