import { useState } from "react";
import { Link } from "react-router-dom";
import ConnectionTest from "../components/common/ConnectionTest";

const Home = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setSuccessMessage("You are all set. Create your account to continue.");
      setIsLoading(false);
    }, 500);
  };

  return (
    <section className="page page-home">
      <div className="home-grid">
        <div className="panel panel-auth">
          <h1 className="panel-title">Welcome to Workoutly</h1>
          <p className="panel-subtitle">
          Build your routine, track your progress, and stay consistent.
          </p>

          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form className="form form-stack" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="quickEmail" className="form-label">
              Email
              </label>
              <input
                id="quickEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={error ? 'form-input form-input-error' : 'form-input'}
                disabled={isLoading}
              />
              {error && <span className="field-error">{error}</span>}
            </div>

            <button
              type="submit"
              className={isLoading ? 'btn btn-primary btn-disabled' : 'btn btn-primary'}
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Get Started'}
            </button>
          </form>

          <p className="auth-link-text">
            New here? <Link to="/register" className="auth-link">Create account</Link>
          </p>
          <p className="auth-link-text">
            Already a member? <Link to="/login" className="auth-link">Login here</Link>
          </p>
        </div>

        <div className="home-connection">
          <ConnectionTest />
        </div>
      </div>
    </section>
  );
};

export default Home;
