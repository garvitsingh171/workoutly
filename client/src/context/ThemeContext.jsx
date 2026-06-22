/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'workoutly-theme-preference';
const THEME_PREFERENCES = ['light', 'dark', 'system'];

const isValidThemePreference = (value) => THEME_PREFERENCES.includes(value);

const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredThemePreference = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isValidThemePreference(storedPreference) ? storedPreference : 'light';
  } catch {
    return 'light';
  }
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState(getStoredThemePreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedTheme = themePreference === 'system' ? systemTheme : themePreference;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.dataset.themePreference = themePreference;
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, themePreference]);

  const setThemePreference = useCallback((nextPreference) => {
    if (!isValidThemePreference(nextPreference)) {
      return;
    }

    setThemePreferenceState(nextPreference);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    } catch {
      // Theme changes still work for the current session when storage is unavailable.
    }
  }, []);

  const value = useMemo(
    () => ({
      themePreference,
      resolvedTheme,
      setThemePreference,
    }),
    [themePreference, resolvedTheme, setThemePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};
