import './ui.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseClass = 'ui-btn';
  const variantClass = `ui-btn--${variant}`;
  const sizeClass = `ui-btn--${size}`;
  const widthClass = fullWidth ? 'ui-btn--full' : '';

  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
