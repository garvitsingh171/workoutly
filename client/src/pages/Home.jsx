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
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={titleStyle}>Welcome to Workoutly</h1>
        <p style={subtitleStyle}>
          Build your routine, track your progress, and stay consistent.
        </p>

        {successMessage && <div style={successStyle}>{successMessage}</div>}
        {error && <div style={errorMessageStyle}>{error}</div>}

        <form style={formStyle} onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="quickEmail" style={labelStyle}>
              Email
            </label>
            <input
              id="quickEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={error ? inputErrorStyle : inputStyle}
              disabled={isLoading}
            />
            {error && <span style={errorTextStyle}>{error}</span>}
          </div>

          <button
            type="submit"
            style={isLoading ? buttonDisabledStyle : buttonStyle}
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Get Started"}
          </button>
        </form>

        <p style={linkTextStyle}>
          New here? <Link to="/register" style={linkStyle}>Create account</Link>
        </p>
        <p style={linkTextStyle}>
          Already a member? <Link to="/login" style={linkStyle}>Login here</Link>
        </p>
      </div>

      <div style={connectionWrapperStyle}>
        <ConnectionTest />
      </div>
    </div>
  );
};

const containerStyle = {
  minHeight: "80vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "2rem",
  flexWrap: "wrap",
  padding: "2rem",
  backgroundColor: "#f8f9fa",
};

const formContainerStyle = {
  maxWidth: "450px",
  width: "100%",
  padding: "2.5rem",
  backgroundColor: "white",
  borderRadius: "10px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "0.5rem",
  color: "#333",
  fontSize: "2rem",
};

const subtitleStyle = {
  textAlign: "center",
  color: "#666",
  marginBottom: "2rem",
  fontSize: "0.95rem",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  marginBottom: "0.5rem",
  fontWeight: "500",
  color: "#333",
  fontSize: "0.9rem",
};

const inputStyle = {
  padding: "0.75rem",
  fontSize: "1rem",
  border: "1px solid #ddd",
  borderRadius: "5px",
  transition: "border-color 0.3s",
};

const inputErrorStyle = {
  ...inputStyle,
  borderColor: "#dc3545",
};

const errorTextStyle = {
  color: "#dc3545",
  fontSize: "0.85rem",
  marginTop: "0.25rem",
};

const buttonStyle = {
  padding: "0.875rem",
  fontSize: "1rem",
  fontWeight: "bold",
  color: "white",
  backgroundColor: "#007bff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  transition: "background-color 0.3s",
  marginTop: "0.5rem",
};

const buttonDisabledStyle = {
  ...buttonStyle,
  backgroundColor: "#6c757d",
  cursor: "not-allowed",
};

const successStyle = {
  padding: "1rem",
  backgroundColor: "#d4edda",
  color: "#155724",
  borderRadius: "5px",
  marginBottom: "1rem",
  border: "1px solid #c3e6cb",
};

const errorMessageStyle = {
  padding: "1rem",
  backgroundColor: "#f8d7da",
  color: "#721c24",
  borderRadius: "5px",
  marginBottom: "1rem",
  border: "1px solid #f5c6cb",
};

const linkTextStyle = {
  textAlign: "center",
  marginTop: "1.5rem",
  color: "#666",
};

const linkStyle = {
  color: "#007bff",
  textDecoration: "none",
  fontWeight: "500",
};

const connectionWrapperStyle = {
  maxWidth: "450px",
  width: "100%",
};

export default Home;
