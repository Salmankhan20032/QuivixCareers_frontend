// src/pages/LoginPage.js

import React, { useState } from "react";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { Form, Button, Spinner } from "react-bootstrap";
import {
  Envelope,
  Lock,
  Eye,
  EyeSlash,
  CheckCircleFill,
} from "react-bootstrap-icons";
import "./LoginPage.css"; // Import our beautiful new styles

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New state for checkboxes
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(true);

  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert("You must accept the privacy policy to log in.");
      return;
    }
    setIsLoading(true);
    try {
      await loginUser(email, password);
      // On success, the AuthContext will handle navigation
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-grid">
        {/* Left Side: Art & Features */}
        <div className="login-art-section">
          <img src="/logo.png" alt="Quivix Logo" className="login-logo mb-4" />
          <h2 className="art-title">Start with QuivixCareers!</h2>
          <ul className="feature-list">
            <li>
              <div className="feature-icon">
                <CheckCircleFill size={12} />
              </div>{" "}
              Access premium internship programs
            </li>
            <li>
              <div className="feature-icon">
                <CheckCircleFill size={12} />
              </div>{" "}
              Track your learning progress
            </li>
            <li>
              <div className="feature-icon">
                <CheckCircleFill size={12} />
              </div>{" "}
              Earn certificates upon completion
            </li>
          </ul>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-form-section">
          <div className="login-header">
            <h1 className="login-title">Welcome Back!</h1>
            <p className="login-subtitle">
              Login to continue your learning journey.
            </p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="form-group">
              <Form.Label className="form-label">Email Address</Form.Label>
              <div className="input-wrapper">
                <Envelope className="input-icon" size={18} />
                <Form.Control
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label className="form-label">Password</Form.Label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <div className="text-end mt-2 forgot-password">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
            </Form.Group>

            {/* --- NEW CHECKBOXES --- */}
            <div className="form-group">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="receiveEmails"
                  checked={receiveEmails}
                  onChange={(e) => setReceiveEmails(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="receiveEmails">
                  Receive emails about new programs and marketing.
                </label>
              </div>
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
                  I accept the{" "}
                  <Link to="/terms-of-service">Terms of Service</Link> and{" "}
                  <Link to="/privacy-policy">Privacy Policy</Link>.
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="login-btn"
              disabled={isLoading || !acceptTerms}
            >
              {isLoading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
              ) : null}
              {isLoading ? "Logging in..." : "Login to Account"}
            </Button>
          </Form>

          <div className="register-link">
            Don't have an account? <Link to="/register">Create one now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
