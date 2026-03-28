const Footer = () => {
  return (
    <footer className="site-footer">
      <p className="site-footer__line">&copy; {new Date().getFullYear()} Workoutly. All rights reserved.</p>
      <p className="site-footer__line site-footer__line--muted">Your ultimate workout tracking platform.</p>
    </footer>
  );
};

export default Footer;
