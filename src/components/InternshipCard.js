// src/components/InternshipCard.js

import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Loader from "./Loader";
import { PeopleFill, ClockHistory } from "react-bootstrap-icons";
import "./InternshipCard.css"; // Import the new stylesheet

const InternshipCard = ({ internship, isApplied, onApplySuccess }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleApply = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`/api/internships/${internship.id}/apply/`);
      if (onApplySuccess) {
        onApplySuccess(internship.id);
      }
      setTimeout(() => {
        setLoading(false);
        navigate(`/internship/${internship.id}`);
      }, 2000); // 2s is enough for feedback, my love!
    } catch (error) {
      setLoading(false);
      console.error("Failed to apply for internship:", error.response?.data);
      alert(
        `Failed to apply: ${
          error.response?.data?.error || "Something went wrong"
        }`
      );
    }
  };

  const handleContinue = () => {
    navigate(`/internship/${internship.id}`);
  };

  return (
    <>
      {loading && <Loader message="Enrolling you..." />}
      <Card className="internship-card h-100">
        <Card.Img
          variant="top"
          src={
            internship.thumbnail ||
            `https://picsum.photos/seed/${internship.id}/400/200`
          } // Fallback image
          className="thumbnail-img"
          alt={internship.title}
        />
        <div className="card-body-custom">
          <Card.Title className="card-title-custom">
            {internship.title}
          </Card.Title>

          {/* === ADDED THIS SECTION, MY LOVE! === */}
          <div className="offered-by">
            <img
              // 2. USE THE IMPORTED LOGO VARIABLE HERE!
              src={quivixLogo}
              alt="QuivixDigital Logo"
              className="company-logo"
            />
            <span className="offered-by-text">Offered by QuivixDigital</span>
          </div>
          {/* ==================================== */}

          <div className="internship-meta">
            <span className="meta-item">
              <PeopleFill className="icon" size={16} />
              {Math.floor(Math.random() * 100) + 10}+ Enrolled
            </span>
            <span className="meta-item">
              <ClockHistory className="icon" size={14} />
              {internship.length_days} days
            </span>
          </div>
        </div>

        <Card.Footer className="card-footer-custom">
          <Button
            className={`btn-custom ${isApplied ? "btn-continue" : "btn-apply"}`}
            onClick={isApplied ? handleContinue : handleApply}
            disabled={loading}
          >
            {isApplied ? "Continue Internship" : "Apply Now"}
          </Button>
        </Card.Footer>
      </Card>
    </>
  );
};

export default InternshipCard;
