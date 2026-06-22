import './ui.css';

const Button = ({
  as: Component = 'button',
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type,
  ...props
}) => {
  const baseClass = 'ui-btn';
  const variantClass = `ui-btn--${variant}`;
  const sizeClass = `ui-btn--${size}`;
  const widthClass = fullWidth ? 'ui-btn--full' : '';
  const buttonProps = Component === 'button' ? { type: type || 'button' } : {};

  return (
    <Component
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      {...buttonProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
