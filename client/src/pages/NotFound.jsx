import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" style={styles.button}>Go Back Home</Link>
    </div>
  );
};

const styles = {
  container: {
    padding: '4rem 2rem',
    textAlign: 'center'
  },
  button: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#333',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px'
  }
};

export default NotFound;
