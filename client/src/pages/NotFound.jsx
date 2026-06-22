import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <section className="page page-not-found">
      <div className="not-found-wrap">
        <h2 className="not-found-title">404 - Page Not Found</h2>
        <p className="not-found-text">The page you are looking for does not exist.</p>
        <Button as={Link} to="/" variant="secondary">Go Back Home</Button>
      </div>
    </section>
  );
};

export default NotFound;
