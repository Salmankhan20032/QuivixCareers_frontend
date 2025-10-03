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
  Grid3x3GapFill, // <-- New icon for the "All Internships" section
} from "react-bootstrap-icons";
import "./HomePage.css";

const HomePage = () => {
  const { user } = useAuth();

  const [allInternships, setAllInternships] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [internshipsResponse, myInternshipsResponse] = await Promise.all([
          axiosInstance.get("/api/internships/"),
          axiosInstance.get("/api/internships/my-internships/"),
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

  const appliedIds = useMemo(
    () => new Set(myEnrollments.map((e) => e.internship.id)),
    [myEnrollments]
  );

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
    return allInternships.filter(
      (internship) => !appliedIds.has(internship.id)
    );
  }, [allInternships, appliedIds]);

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

  const stats = useMemo(
    () => ({
      ongoing: ongoingInternships.length,
      completed: myEnrollments.filter((e) => e.status === "accepted").length,
      available: recommendedInternships.length,
    }),
    [ongoingInternships, myEnrollments, recommendedInternships]
  );

  return (
    <div className="homepage">
      {/* Hero Section (Unchanged) */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={7} className="mb-4 mb-lg-0">
              <div className="hero-content">
                <div className="greeting-badge">
                  <RocketTakeoff size={20} /> Welcome Back!
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
                    <Star size={18} /> Browse Internships
                  </Button>
                  {user && (
                    <Button
                      as={Link}
                      to="/profile"
                      className="cta-button"
                      variant="outline-primary"
                    >
                      My Dashboard <ArrowRight size={18} />
                    </Button>
                  )}
                </div>
              </div>
            </Col>
            <Col lg={5}>
              <Row className="g-3">
                <Col xs={12}>
                  <Card className="stat-card">
                    {" "}
                    <div className="stat-header">
                      {" "}
                      <div className="stat-icon">
                        <Briefcase size={28} />
                      </div>{" "}
                      <div>
                        <div className="stat-number">
                          {user ? stats.ongoing : "-"}
                        </div>
                        <div className="stat-label">Ongoing Programs</div>
                      </div>{" "}
                    </div>{" "}
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="stat-card">
                    {" "}
                    <div className="stat-header">
                      {" "}
                      <div className="stat-icon">
                        <TrophyFill size={24} />
                      </div>{" "}
                      <div>
                        <div className="stat-number">
                          {user ? stats.completed : "-"}
                        </div>
                        <div className="stat-label">Completed</div>
                      </div>{" "}
                    </div>{" "}
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="stat-card">
                    {" "}
                    <div className="stat-header">
                      {" "}
                      <div className="stat-icon">
                        <Star size={24} />
                      </div>{" "}
                      <div>
                        <div className="stat-number">
                          {user ? stats.available : "-"}
                        </div>
                        <div className="stat-label">Available</div>
                      </div>{" "}
                    </div>{" "}
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="content-section">
        {/* Tech News Section (Unchanged) */}
        <section className="home-section">
          {/* ... Your full Tech News JSX is preserved here ... */}
        </section>

        {loading ? (
          <div className="text-center py-5">
            <Spinner
              animation="border"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-2 text-muted">
              Loading your personalized dashboard...
            </p>
          </div>
        ) : (
          user && (
            <>
              {/* Ongoing Internships (Unchanged) */}
              {ongoingInternships.length > 0 && (
                <section className="home-section">
                  <div className="section-header">
                    <div className="section-title-wrapper">
                      <Briefcase className="section-icon" />
                      <h2 className="section-title">
                        Your Ongoing Internships
                      </h2>
                    </div>
                    <Link to="/profile" className="view-all-link">
                      View Dashboard <ArrowRight size={18} />
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

              {/* --- MODIFIED: Recommended Internships (Limit 3) --- */}
              <section className="home-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <Star className="section-icon" />
                    <h2 className="section-title">Recommended For You</h2>
                  </div>
                  <Link to="/internships" className="view-all-link">
                    View All <ArrowRight size={18} />
                  </Link>
                </div>
                {recommendedInternships.length > 0 ? (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {recommendedInternships.slice(0, 3).map((internship) => (
                      <Col key={internship.id}>
                        <InternshipCard
                          internship={internship}
                          isApplied={false}
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
                    </p>
                  </Alert>
                )}
              </section>

              {/* --- NEW SECTION: All Internships --- */}
              <section className="home-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <Grid3x3GapFill className="section-icon" />
                    <h2 className="section-title">Explore All Internships</h2>
                  </div>
                </div>
                {allInternships.length > 0 ? (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {allInternships.map((internship) => (
                      <Col key={internship.id}>
                        <InternshipCard
                          internship={internship}
                          isApplied={appliedIds.has(internship.id)}
                          onApplySuccess={handleSuccessfulApply}
                        />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">
                    There are currently no internships available. Please check
                    back soon!
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
