import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <section className="page page-not-found">
      <div className="not-found-wrap">
        <h2 className="not-found-title">404 - Page Not Found</h2>
        <p className="not-found-text">The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-dark">Go Back Home</Link>
      </div>
    </section>
  );
};

export default NotFound;
