import { useTheme } from '../../context/ThemeContext';

const themeOptions = [
  { value: 'light', label: 'Light', shortLabel: 'L' },
  { value: 'dark', label: 'Dark', shortLabel: 'D' },
  { value: 'system', label: 'System', shortLabel: 'S' },
];

const ThemeToggle = () => {
  const { themePreference, resolvedTheme, setThemePreference } = useTheme();

  return (
    <div className="theme-toggle" aria-label={`Theme selector. Current theme is ${themePreference}.`}>
      <span className="theme-toggle__label">Theme</span>
      <div className="theme-toggle__options" role="group" aria-label="Choose color theme">
        {themeOptions.map((option) => {
          const isActive = themePreference === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`theme-toggle__option ${isActive ? 'theme-toggle__option--active' : ''}`.trim()}
              onClick={() => setThemePreference(option.value)}
              aria-pressed={isActive}
              aria-label={`Use ${option.label} theme`}
              title={option.value === 'system' ? `System (${resolvedTheme})` : option.label}
            >
              <span className="theme-toggle__mark" aria-hidden="true">{option.shortLabel}</span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeToggle;
