// src/pages/ContactPage.js

import React from "react";
import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";
import { EnvelopeFill, TelephoneFill, GeoAltFill } from "react-bootstrap-icons";

const ContactPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      "Thank you for your message! This is a demo form, but we've received your submission."
    );
    e.target.reset();
  };

  return (
    <Container className="my-5">
      <Card className="p-4 shadow-sm">
        <Card.Body>
          <h1
            className="text-center display-5 mb-5"
            style={{ color: "#6e8efb" }}
          >
            Get In Touch
          </h1>
          <Row>
            <Col md={5}>
              <h4>Contact Information</h4>
              <p>
                Have a question or want to partner with us? Reach out through
                any of the channels below.
              </p>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-center">
                  <EnvelopeFill size={20} className="me-3" color="#6e8efb" />
                  <span>support@quivixinternships.com</span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <TelephoneFill size={20} className="me-3" color="#6e8efb" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="d-flex align-items-center">
                  <GeoAltFill size={20} className="me-3" color="#6e8efb" />
                  <span>123 Tech Avenue, Silicon Valley, CA</span>
                </li>
              </ul>
            </Col>

            <Col md={7}>
              <h4>Send us a Message</h4>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="contactForm.Name">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" placeholder="John Doe" required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="contactForm.Email">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="contactForm.Message">
                  <Form.Label>Message</Form.Label>
                  <Form.Control as="textarea" rows={4} required />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Submit Message
                </Button>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ContactPage;
