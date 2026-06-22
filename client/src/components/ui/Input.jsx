import { forwardRef, useId } from 'react';
import './ui.css';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  groupClassName = '',
  id, 
  describedBy,
  ...props 
}, ref) => {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const ariaDescribedBy = [describedBy, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`ui-input-group ${groupClassName}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="ui-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`ui-input ${error ? 'ui-input--error' : ''} ${className}`.trim()}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
      {error && (
        <span id={errorId} className="ui-error-text" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
