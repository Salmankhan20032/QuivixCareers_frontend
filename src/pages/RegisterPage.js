import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import {
  Person,
  Envelope,
  Lock,
  GlobeAmericas,
  Eye,
  EyeSlash,
  CheckCircleFill,
} from "react-bootstrap-icons";
import { nationalities } from "../utils/nationalities";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    password2: "",
    nationality: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { registerUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password2) {
      setError("Passwords do not match!");
      return;
    }
    if (passwordStrength.score < 2) {
      setError("Password is too weak. Please choose a stronger password.");
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(
        formData.email,
        formData.fullName,
        formData.password,
        formData.password2,
        formData.nationality
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = useMemo(() => {
    const password = formData.password;
    let score = 0;
    if (!password) return { score: 0, text: "" };
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    let text = "";
    if (score <= 1) text = "Weak";
    else if (score <= 3) text = "Medium";
    else text = "Strong";
    return { score, text };
  }, [formData.password]);

  const { email, fullName, password, password2, nationality } = formData;
  const isFormInvalid =
    !email ||
    !fullName ||
    !password ||
    !password2 ||
    !nationality ||
    !acceptTerms ||
    isLoading;

  return (
    <div className="register-page-container">
      <div className="register-grid">
        <div className="register-art-section">
          <img src="/logo.png" alt="Quivix Logo" className="logo mb-4" />
          <h2 className="art-title">Join a Community of Innovators</h2>
          <ul className="feature-list">
            <li>
              <div className="feature-icon">
                <CheckCircleFill size={12} />
              </div>{" "}
              Build a portfolio with real-world projects.
            </li>
            <li>
              <div className="feature-icon">
                <CheckCircleFill size={12} />
              </div>{" "}
              Get mentored by industry experts.
            </li>
            <li>
              <div className="feature-icon">
                <CheckCircleFill size={12} />
              </div>{" "}
              Kickstart your dream career in tech today.
            </li>
          </ul>
        </div>

        <div className="register-form-section">
          {/* --- NEW: MOBILE-ONLY HEADER --- */}
          <div className="mobile-header">
            <img src="/logo.png" alt="Quivix Logo" className="logo" />
            <h2 className="brand-title">QuivixCareers</h2>
          </div>
          {/* --- END MOBILE-ONLY HEADER --- */}

          <div className="register-header">
            <h1 className="register-title">Create Your Account</h1>
            <p className="register-subtitle">
              Start your journey with us today.
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="form-group">
              <Form.Label className="form-label">Full Name</Form.Label>
              <div className="input-wrapper">
                <Person className="input-icon" size={18} />
                <Form.Control
                  type="text"
                  name="fullName"
                  className="form-control" /* Using standard bootstrap class */
                  value={fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Email Address</Form.Label>
              <div className="input-wrapper">
                <Envelope className="input-icon" size={18} />
                <Form.Control
                  type="email"
                  name="email"
                  className="form-control"
                  value={email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Nationality</Form.Label>
              <div className="input-wrapper">
                <GlobeAmericas className="input-icon" size={18} />
                <Form.Select
                  name="nationality"
                  className="form-control"
                  value={nationality}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select your nationality...
                  </option>
                  {nationalities.map((nat) => (
                    <option key={nat} value={nat}>
                      {nat}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Password</Form.Label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control"
                  value={password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="password-strength-meter">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`strength-bar ${
                      i < passwordStrength.score
                        ? `filled ${passwordStrength.text.toLowerCase()}`
                        : ""
                    }`}
                  ></div>
                ))}
              </div>
              <div
                className={`strength-text ${passwordStrength.text.toLowerCase()}`}
              >
                {passwordStrength.text}
              </div>
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Confirm Password</Form.Label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <Form.Control
                  type={showPassword2 ? "text" : "password"}
                  name="password2"
                  className="form-control"
                  value={password2}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword2(!showPassword2)}
                >
                  {showPassword2 ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </Form.Group>

            <div className="form-group">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                />
                <label className="form-check-label" htmlFor="acceptTerms">
                  I accept the <Link to="/terms">Terms of Service</Link> and{" "}
                  <Link to="/privacy">Privacy Policy</Link>.
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="register-btn"
              disabled={isFormInvalid}
            >
              {isLoading && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
              )}
              Create Account
            </Button>
          </Form>

          <div className="login-link">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
