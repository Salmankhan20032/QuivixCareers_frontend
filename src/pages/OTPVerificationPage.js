// src/pages/OTPVerificationPage.js

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { EnvelopeCheckFill } from "react-bootstrap-icons";
import "./OTPVerificationPage.css"; // Import our beautiful new styles

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { loginAfterVerification } = useAuth();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${baseURL}/api/auth/verify-otp/`, {
        email,
        otp,
      });
      loginAfterVerification(response.data);
      navigate("/onboarding");
    } catch (err) {
      setError(
        err.response?.data?.error || "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${baseURL}/api/auth/resend-otp/`, { email });
      setSuccess("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-page-container">
      <div className="otp-card">
        <div className="otp-header">
          <div className="otp-icon-wrapper">
            <EnvelopeCheckFill size={30} />
          </div>
          <h1 className="otp-title">Email Verification</h1>
          <p className="otp-subtitle">
            We've sent a 6-digit code to <strong>{email}</strong>. Please enter
            it below to continue.
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleVerify}>
          <Form.Group className="mb-4">
            <Form.Control
              type="text"
              placeholder="_ _ _ _ _ _"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))} // Allow only numbers
              className="otp-input"
              autoFocus
            />
          </Form.Group>

          <div className="d-grid">
            <Button
              type="submit"
              variant="primary"
              className="otp-verify-btn"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Verify Account"
              )}
            </Button>
          </div>
        </Form>

        <div className="text-center mt-3">
          <Button
            variant="link"
            className="resend-link"
            onClick={handleResend}
            disabled={loading}
          >
            Didn't receive the code? Resend
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
