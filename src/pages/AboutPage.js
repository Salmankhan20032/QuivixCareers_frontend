// src/pages/AboutPage.js

import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  BriefcaseFill,
  MortarboardFill,
  GlobeAmericas,
} from "react-bootstrap-icons";
import "./AboutPage.css"; // Import our new stylesheet

const AboutPage = () => {
  return (
    <div className="about-page">
      <Container>
        {/* Page Header */}
        <div className="about-header">
          <h1 className="about-title">About QuivixCareers</h1>
          <p className="lead about-subtitle">
            Bridging the gap between ambitious students and the future of
            technology.
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="about-content-card">
          <Card.Body>
            <p>
              At QuivixCareers, our mission is to provide aspiring developers,
              data scientists, and tech enthusiasts with a real-world, hands-on
              learning experience. We believe that practical application is the
              key to mastering technical skills. Our platform offers structured
              internship programs designed by industry experts to help you build
              a standout portfolio, gain confidence, and kickstart your career
              in tech.
            </p>
          </Card.Body>
        </Card>

        {/* Features Section */}
        <section className="features-section">
          <Row>
            {/* Feature 1: Real-World Projects */}
            <Col md={6} lg={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <BriefcaseFill size={30} />
                </div>
                <h3>Real-World Projects</h3>
                <p>
                  Gain practical experience by working on projects that mirror
                  industry challenges and workflows.
                </p>
              </div>
            </Col>

            {/* Feature 2: Expert-Led Curriculum */}
            <Col md={6} lg={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <MortarboardFill size={30} />
                </div>
                <h3>Expert-Led Curriculum</h3>
                <p>
                  Follow a clear, structured roadmap designed by professionals
                  to guide your learning journey from start to finish.
                </p>
              </div>
            </Col>

            {/* Feature 3: Launch Your Career */}
            <Col md={6} lg={4} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <GlobeAmericas size={30} />
                </div>
                <h3>Launch Your Career</h3>
                <p>
                  Build a professional portfolio, earn a certificate, and take
                  the first big step toward your dream job in tech.
                </p>
              </div>
            </Col>
          </Row>
        </section>
      </Container>
    </div>
  );
};

export default AboutPage;
