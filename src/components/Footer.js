// src/components/Footer.js

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github, Facebook } from "react-bootstrap-icons";
import "./Footer.css"; // We will create this stylesheet next

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <Container>
        <Row className="gy-4">
          {/* Brand and Tagline Section */}
          <Col lg={4} md={12}>
            <div className="footer-brand">
              <img src="/logo.png" alt="Quivix Logo" className="footer-logo" />
              <p className="footer-tagline">
                Empowering the next generation of tech talent through hands-on,
                real-world internship experiences.
              </p>
            </div>
          </Col>

          {/* Quick Links Section */}
          <Col lg={2} md={4} xs={6}>
            <h5 className="footer-heading">Quick Links</h5>
            <ul className="footer-links">
              <li>
                <Link to="/internships">Internships</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </Col>

          {/* User Links Section */}
          <Col lg={2} md={4} xs={6}>
            <h5 className="footer-heading">For Users</h5>
            <ul className="footer-links">
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/profile">My Profile</Link>
              </li>
            </ul>
          </Col>

          {/* Social Media Section */}
          <Col lg={4} md={4}>
            <h5 className="footer-heading">Follow Us</h5>
            <p className="text-muted">
              Stay up to date with the latest news and opportunities.
            </p>
            <div className="social-icons">
              <a
                href="#"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook />
              </a>
            </div>
          </Col>
        </Row>

        <hr className="footer-divider" />

        {/* Bottom Bar: Copyright and Legal Links */}
        <Row className="footer-bottom align-items-center">
          <Col md={6}>
            <p className="mb-0">
              &copy; {currentYear} Quivix. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <Link to="/privacy-policy" className="bottom-link">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="bottom-link">
              Terms of Service
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
