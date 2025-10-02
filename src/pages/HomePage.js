// src/pages/HomePage.js

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge,
  Button,
} from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import InternshipCard from "../components/InternshipCard";
import {
  Newspaper,
  Briefcase,
  Star,
  GraphUpArrow,
  Award,
  Clock,
  ArrowRight,
  TrophyFill,
  RocketTakeoff,
} from "react-bootstrap-icons";
import "./HomePage.css"; // Import the single, refactored CSS file

const HomePage = () => {
  const { user } = useAuth();

  const [allInternships, setAllInternships] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [internshipsResponse, myInternshipsResponse] = await Promise.all([
          axiosInstance.get("/api/internships/"),
          axiosInstance.get("/api/internships/profile/"),
        ]);

        setAllInternships(internshipsResponse.data);
        setMyEnrollments(myInternshipsResponse.data);
      } catch (error) {
        console.error("Could not fetch required data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  const ongoingInternships = useMemo(
    () =>
      myEnrollments.filter(
        (enrollment) =>
          enrollment.status === "in_progress" ||
          enrollment.status === "awaiting_evaluation"
      ),
    [myEnrollments]
  );

  const recommendedInternships = useMemo(() => {
    const appliedIds = new Set(myEnrollments.map((e) => e.internship.id));
    return allInternships.filter(
      (internship) => !appliedIds.has(internship.id)
    );
  }, [allInternships, myEnrollments]);

  const handleSuccessfulApply = (appliedId) => {
    const appliedInternship = allInternships.find((i) => i.id === appliedId);
    if (appliedInternship) {
      const newEnrollment = {
        id: Math.random(),
        internship: appliedInternship,
        status: "in_progress",
      };
      setMyEnrollments((prev) => [...prev, newEnrollment]);
    }
  };

  const stats = {
    ongoing: ongoingInternships.length,
    completed: myEnrollments.filter((e) => e.status === "accepted").length,
    available: recommendedInternships.length,
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={7} className="mb-4 mb-lg-0">
              <div className="hero-content">
                <div className="greeting-badge">
                  <RocketTakeoff size={20} />
                  Welcome Back!
                </div>
                <h1 className="hero-title">
                  Hello,{" "}
                  <span className="highlight">
                    {user?.full_name || "Guest"}
                  </span>
                  !
                </h1>
                <p className="hero-subtitle">
                  Ready to level up your career? Discover amazing internship
                  opportunities and build real-world skills.
                </p>
                <div className="cta-buttons">
                  <Button
                    as={Link}
                    to="/internships"
                    className="cta-button"
                    variant="primary"
                  >
                    <Star size={18} />
                    Browse Internships
                  </Button>
                  {user && (
                    <Button
                      as={Link}
                      to="/my-internships"
                      className="cta-button"
                      variant="outline-primary"
                    >
                      My Dashboard
                      <ArrowRight size={18} />
                    </Button>
                  )}
                </div>
              </div>
            </Col>
            <Col lg={5}>
              <Row className="g-3">
                <Col xs={12}>
                  <Card className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon">
                        <Briefcase size={28} />
                      </div>
                      <div>
                        <div className="stat-number">
                          {user ? stats.ongoing : "-"}
                        </div>
                        <div className="stat-label">Ongoing Programs</div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon">
                        <TrophyFill size={24} />
                      </div>
                      <div>
                        <div className="stat-number">
                          {user ? stats.completed : "-"}
                        </div>
                        <div className="stat-label">Completed</div>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon">
                        <Star size={24} />
                      </div>
                      <div>
                        <div className="stat-number">
                          {user ? stats.available : "-"}
                        </div>
                        <div className="stat-label">Available</div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="content-section">
        {/* Tech News Section */}
        <section className="home-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <Newspaper className="section-icon" />
              <h2 className="section-title">Latest in Tech</h2>
            </div>
            <Badge
              bg="primary"
              className="d-flex align-items-center gap-2 px-3 py-2 fs-6"
            >
              <GraphUpArrow size={14} /> Trending
            </Badge>
          </div>
          <Row xs={1} md={2} lg={4} className="g-4">
            {[...Array(4)].map((_, index) => (
              <Col key={index}>
                <Card className="news-card">
                  <div className="news-image-wrapper">
                    <Card.Img
                      variant="top"
                      src={`https://picsum.photos/seed/${index + 1}/400/200`}
                      className="news-image"
                      alt="Tech News"
                    />
                    <div className="news-overlay">
                      <Badge
                        bg={["danger", "info", "warning", "success"][index]}
                      >
                        {["Hot", "Science", "Security", "Innovation"][index]}
                      </Badge>
                    </div>
                  </div>
                  <Card.Body>
                    <Card.Title className="news-title">
                      {
                        [
                          "Major AI Firm Releases Next-Gen Model",
                          "Quantum Computing Achieves New Milestone",
                          "Cybersecurity Alert: New Phishing Scam",
                          "The Rise of Edge Native Applications",
                        ][index]
                      }
                    </Card.Title>
                  </Card.Body>
                  <div className="news-footer">
                    <small className="text-muted d-flex align-items-center gap-1">
                      <Clock size={12} /> TechCrunch • {index + 2}h ago
                    </small>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" />
            <p>Loading your internships...</p>
          </div>
        ) : (
          user && (
            <>
              {/* Ongoing Internships */}
              {ongoingInternships.length > 0 && (
                <section className="home-section">
                  <div className="section-header">
                    <div className="section-title-wrapper">
                      <Briefcase className="section-icon" />
                      <h2 className="section-title">
                        Your Ongoing Internships
                      </h2>
                    </div>
                    <Link to="/my-internships" className="view-all-link">
                      View All <ArrowRight size={18} />
                    </Link>
                  </div>
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {ongoingInternships.map((enrollment) => (
                      <Col key={enrollment.internship.id}>
                        <InternshipCard
                          internship={enrollment.internship}
                          isApplied={true}
                        />
                      </Col>
                    ))}
                  </Row>
                </section>
              )}

              {/* Recommended Internships */}
              <section className="home-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <Star className="section-icon" />
                    <h2 className="section-title">Recommended For You</h2>
                  </div>
                </div>
                {recommendedInternships.length > 0 ? (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {recommendedInternships.map((internship) => (
                      <Col key={internship.id}>
                        <InternshipCard
                          internship={internship}
                          onApplySuccess={handleSuccessfulApply}
                        />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="light" className="empty-state">
                    <div className="empty-state-icon">
                      <Award />
                    </div>
                    <h3>You're All Caught Up!</h3>
                    <p>
                      Amazing work! You're enrolled in all available
                      internships.
                      <br />
                      Visit your <Link to="/my-internships">Dashboard</Link> to
                      track your progress.
                    </p>
                  </Alert>
                )}
              </section>
            </>
          )
        )}
      </Container>
    </div>
  );
};

export default HomePage;
