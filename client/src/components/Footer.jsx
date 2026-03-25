const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Workoutly. All rights reserved.</p>
      <p>Your ultimate workout tracking platform.</p>
    </footer>
  );
};

const styles = {
  footer: {
    padding: '1rem 0',
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
    marginTop: 'auto'
  }
};

export default Footer;
