// src/pages/SettingsPage.js
import React from "react";
import { Container, Card } from "react-bootstrap";

const SettingsPage = () => {
  return (
    <Container className="my-5">
      <Card>
        <Card.Header as="h4">Settings</Card.Header>
        <Card.Body>
          <p>
            This is where user settings will go. Here are some dummy options:
          </p>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="emailNotifications"
              defaultChecked
            />
            <label className="form-check-label" htmlFor="emailNotifications">
              Receive Email Notifications
            </label>
          </div>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="darkMode" />
            <label className="form-check-label" htmlFor="darkMode">
              Enable Dark Mode
            </label>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SettingsPage;
