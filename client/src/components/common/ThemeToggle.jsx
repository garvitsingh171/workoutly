import { useTheme } from '../../context/ThemeContext';

const themeOptions = [
  { value: 'light', label: 'Light', shortLabel: 'L' },
  { value: 'dark', label: 'Dark', shortLabel: 'D' },
  { value: 'system', label: 'System', shortLabel: 'S' },
];

const ThemeToggle = () => {
  const { themePreference, resolvedTheme, setThemePreference } = useTheme();
  const currentIndex = themeOptions.findIndex((option) => option.value === themePreference);
  const currentTheme = themeOptions[currentIndex] || themeOptions[0];
  const nextTheme = themeOptions[(currentIndex + 1) % themeOptions.length] || themeOptions[0];

  const handleCycleTheme = () => {
    setThemePreference(nextTheme.value);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleCycleTheme}
      aria-label={`Theme is ${currentTheme.label}. Switch to ${nextTheme.label}.`}
      title={`Theme: ${currentTheme.label}${themePreference === 'system' ? ` (${resolvedTheme})` : ''}`}
    >
      <span className="theme-toggle__mark" aria-hidden="true">{currentTheme.shortLabel}</span>
      <span className="theme-toggle__text">{currentTheme.label}</span>
    </button>
  );
};

export default ThemeToggle;
