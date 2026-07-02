import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import api, { getErrorMessage } from "../services/api";
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Clear previous messages
    setSuccessMessage("");
    setApiError("");

    // Validate form
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    // Start loading
    setIsLoading(true);

    try {
      // Prepare data to send (exclude confirmPassword)
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      // Send POST request to backend
      await api.post("/api/users/register", registrationData);

      // Registration successful
      setSuccessMessage(
        "Account created successfully! Redirecting to login...",
      );
      toast.success('Account created successfully!');

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to connect to server. Please check your connection and try again.",
      );
      setApiError(message);
      toast.error(message);
    } finally {
      // Stop loading regardless of success/failure
      setIsLoading(false);
    }
  };

  return (
    <section className="page page-auth">
      <div className="panel panel-auth">
        <div className="auth-brand">
          <img src="/workoutly.png" alt="Workoutly logo" className="auth-brand__logo" />
          <span>Workoutly</span>
        </div>
        <h1 className="panel-title">Create Your Account</h1>
        <p className="panel-subtitle">Join Workoutly and start working out today</p>

        {/* Success Message */}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        {/* API Error Message */}
        {apiError && <div className="alert alert-error">{apiError}</div>}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="form form-stack">
          <Input
            label="Name *"
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            error={errors.name}
            disabled={isLoading}
          />

          <Input
            label="Email *"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            error={errors.email}
            disabled={isLoading}
          />

          <Input
            label="Password *"
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password (min 6 characters)"
            error={errors.password}
            disabled={isLoading}
          />

          <Input
            label="Confirm Password *"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        {/* Login Link */}
        <p className="auth-link-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login here
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
