// src/pages/OnboardingPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
// THE FIX IS HERE: Replaced 'DeviceMobile' with the correct 'Phone' icon
import {
  CameraFill,
  MortarboardFill,
  Building,
  PuzzleFill,
  CodeSlash,
  Phone,
  Controller,
  Robot,
} from "react-bootstrap-icons";
import "./OnboardingPage.css";

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [interest, setInterest] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user has already completed onboarding, redirect them home.
    if (user && (user.profile?.university || user.profile?.interest)) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleNext = () => {
    setError(""); // Clear previous errors
    if (step === 2 && (!university.trim() || !major.trim())) {
      setError("Please fill in both university and major.");
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      // 3 MB
      setError("Profile picture must be less than 3 MB.");
      setProfilePic(null);
      setPreviewUrl(null);
    } else {
      setError("");
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!interest) {
      setError("Please select an interest before finishing.");
      return;
    }

    setLoading(true);
    setError("");
    const formData = new FormData();

    // Use dot notation for nested profile fields
    if (profilePic) formData.append("profile.profile_picture", profilePic);
    if (university.trim())
      formData.append("profile.university", university.trim());
    if (major.trim()) formData.append("profile.major", major.trim());
    if (interest) formData.append("profile.interest", interest);

    try {
      const response = await axiosInstance.put("/api/auth/profile/", formData);
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const interests = [
    { name: "Web Development", icon: <CodeSlash /> },
    // THE FIX IS HERE: Using the correct <Phone /> icon
    { name: "Mobile App Development", icon: <Phone /> },
    { name: "Game Development", icon: <Controller /> },
    { name: "Data Science / AI", icon: <Robot /> },
    { name: "Cloud & DevOps", icon: <PuzzleFill /> },
  ];

  // Show a spinner while the user object is loading from context
  if (!user) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <Spinner animation="border" />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="step-header">
              <h2 className="step-title">Welcome, {user.full_name}!</h2>
              <p className="step-subtitle">
                Let's start by setting up your profile picture.
              </p>
            </div>
            <label className="avatar-upload-wrapper">
              <div
                className="avatar-preview"
                style={{ backgroundImage: `url(${previewUrl})` }}
              >
                {!previewUrl && (
                  <>
                    <CameraFill className="upload-icon" />
                    <span className="upload-text">Click to upload</span>
                  </>
                )}
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  hidden
                />
              </div>
            </label>
          </>
        );
      case 2:
        return (
          <>
            <div className="step-header">
              <h2 className="step-title">Your Education</h2>
              <p className="step-subtitle">
                This helps us recommend relevant opportunities.
              </p>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>
                <Building className="me-2" /> University Name
              </Form.Label>
              <Form.Control
                className="form-input"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g., Stanford University"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>
                <MortarboardFill className="me-2" /> Major
              </Form.Label>
              <Form.Control
                className="form-input"
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g., Computer Science"
                required
              />
            </Form.Group>
          </>
        );
      case 3:
        return (
          <>
            <div className="step-header">
              <h2 className="step-title">Your Interests</h2>
              <p className="step-subtitle">
                Choose one field you're most passionate about.
              </p>
            </div>
            <div className="interests-grid">
              {interests.map((item) => (
                <label key={item.name} className="interest-card-label">
                  <input
                    type="radio"
                    name="interest"
                    value={item.name}
                    checked={interest === item.name}
                    onChange={(e) => setInterest(e.target.value)}
                    className="interest-card-radio"
                  />
                  <div className="interest-card">
                    <div className="interest-icon">{item.icon}</div>
                    <div className="interest-name">{item.name}</div>
                  </div>
                </label>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-page-container">
      <div className="onboarding-card">
        {/* Visual Stepper */}
        <div className="stepper-container">
          {["Profile", "Education", "Interests"].map((label, index) => (
            <React.Fragment key={label}>
              <div
                className={`step-item ${step === index + 1 ? "active" : ""} ${
                  step > index + 1 ? "completed" : ""
                }`}
              >
                <div className="step-circle">
                  {step > index + 1 ? "✓" : index + 1}
                </div>
                <div className="step-label">{label}</div>
              </div>
              {index < 2 && <div className="step-connector"></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="onboarding-body">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          {renderStepContent()}

          <div className="onboarding-nav mt-4">
            {step > 1 ? (
              <Button
                variant="secondary"
                className="onboarding-btn"
                onClick={handleBack}
              >
                Back
              </Button>
            ) : (
              <div /> // This empty div keeps the "Next" button on the right side
            )}

            {step < 3 ? (
              <Button className="onboarding-btn" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                className="onboarding-btn"
                onClick={handleSubmit}
                disabled={loading || !interest}
              >
                {loading ? (
                  <>
                    <Spinner as="span" size="sm" /> Finishing...
                  </>
                ) : (
                  "Finish Setup"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
