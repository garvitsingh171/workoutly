const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="page-state page-state--spinner" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true"></div>
      <p className="loading-spinner__text">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
