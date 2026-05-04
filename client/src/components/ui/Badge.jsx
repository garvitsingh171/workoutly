import './ui.css';

const Badge = ({ children, color = 'neutral', className = '', ...props }) => {
  return (
    <span className={`ui-badge ui-badge--${color} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
