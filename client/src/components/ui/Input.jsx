import { forwardRef } from 'react';
import './ui.css';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  id, 
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="ui-input-group">
      {label && (
        <label htmlFor={inputId} className="ui-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`ui-input ${error ? 'ui-input--error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="ui-error-text">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
