// src/pages/InternshipsListPage.js

import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Badge,
  Card,
} from "react-bootstrap";
import { Award, Briefcase, RocketTakeoff } from "react-bootstrap-icons";
import InternshipCard from "../components/InternshipCard";
import "./InternshipsListPage.css"; // Import the new stylesheet

const InternshipsListPage = () => {
  const [internships, setInternships] = useState([]);
  const [appliedInternshipIds, setAppliedInternshipIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [internshipsResponse, myInternshipsResponse] = await Promise.all([
          axiosInstance.get("/api/internships/"),
          axiosInstance.get("/api/internships/my-internships/"),
        ]);

        const appliedIds = new Set(
          myInternshipsResponse.data.map((e) => e.internship.id)
        );

        setInternships(internshipsResponse.data);
        setAppliedInternshipIds(appliedIds);
      } catch (err) {
        setError("Failed to load internships. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const groupedInternships = useMemo(() => {
    if (!internships) return {};
    return internships.reduce((acc, internship) => {
      const field = internship.field || "General";
      if (!acc[field]) acc[field] = [];
      acc[field].push(internship);
      return acc;
    }, {});
  }, [internships]);

  const handleSuccessfulApply = (appliedId) => {
    setAppliedInternshipIds((prevIds) => new Set(prevIds).add(appliedId));
  };

  // NEW: Returns a theme class and icon for styling
  const getFieldStyle = (field) => {
    const styles = {
      "Web Development": { icon: "🌐", themeClass: "theme-web" },
      "Mobile App Development": { icon: "📱", themeClass: "theme-mobile" },
      "Data Science / AI": { icon: "🤖", themeClass: "theme-data" },
      Default: { icon: "💼", themeClass: "theme-default" },
    };
    return styles[field] || styles["Default"];
  };

  if (loading) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center loading-container">
        <Spinner animation="border" variant="primary" />
        <h3 className="mt-4 text-muted">Loading Internships...</h3>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  const totalInternships = internships.length;
  const appliedCount = appliedInternshipIds.size;

  return (
    <div className="internships-page">
      <Container>
        {/* Page Header */}
        <div className="page-header">
          <Row className="align-items-center gy-4">
            <Col lg={8}>
              <Badge pill bg="primary" className="px-3 py-2 mb-3 fs-6">
                <RocketTakeoff className="me-2" /> Start Your Journey
              </Badge>
              <h1 className="page-title">Explore Internships</h1>
              <p className="page-subtitle">
                Find the perfect program to launch your career. Gain real-world
                experience and earn certificates.
              </p>
            </Col>
            <Col lg={4}>
              <Row className="g-3">
                <Col xs={6}>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Briefcase />
                    </div>
                    <div className="stat-number">{totalInternships}</div>
                    <div className="stat-label">Programs</div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Award />
                    </div>
                    <div className="stat-number">{appliedCount}</div>
                    <div className="stat-label">Applied</div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        {/* Internships by Field */}
        {Object.keys(groupedInternships).length > 0 ? (
          Object.keys(groupedInternships).map((field) => {
            const fieldStyle = getFieldStyle(field);
            const fieldInternships = groupedInternships[field];
            return (
              <div key={field} className={`mb-5 ${fieldStyle.themeClass}`}>
                {/* Field Header Card */}
                <div className="field-header">
                  <Row className="align-items-center">
                    <Col xs="auto">
                      <div className="field-icon">{fieldStyle.icon}</div>
                    </Col>
                    <Col>
                      <h2 className="field-title mb-1">{field}</h2>
                      <p className="text-muted mb-0">
                        {fieldInternships.length} programs available
                      </p>
                    </Col>
                  </Row>
                </div>
                {/* Internship Cards Grid */}
                <Row xs={1} md={2} lg={3} className="g-4">
                  {fieldInternships.map((internship) => (
                    <Col key={internship.id}>
                      <InternshipCard
                        internship={internship}
                        isApplied={appliedInternshipIds.has(internship.id)}
                        onApplySuccess={handleSuccessfulApply}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            );
          })
        ) : (
          <Card className="text-center py-5">
            <Card.Body>
              <div style={{ fontSize: "4rem" }} className="mb-3">
                🔍
              </div>
              <h3 className="mb-2">No Internships Available</h3>
              <p className="text-muted mb-0">
                Please check back later for new opportunities!
              </p>
            </Card.Body>
          </Card>
        )}

        {Object.keys(groupedInternships).length > 0 && (
          <div className="cta-card mt-5">
            <span className="cta-icon">💡</span>
            <h3 className="mb-2 text-dark">Not Sure Where to Start?</h3>
            <p
              className="lead text-muted"
              style={{ maxWidth: "600px", margin: "0 auto" }}
            >
              Every expert was once a beginner. Choose any path that excites you
              and start your journey today!
            </p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default InternshipsListPage;
