// src/pages/InternshipDetailPage.js

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import Loader from "../components/Loader";
import { useNotifications } from "../contexts/NotificationContext";
import {
  FaBook,
  FaTasks,
  FaTrophy,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaExternalLinkAlt,
} from "react-icons/fa";

const InternshipDetailPage = () => {
  const { id } = useParams();
  const { addNotification } = useNotifications();

  // State for data fetched from API
  const [internship, setInternship] = useState(null);
  const [userEnrollment, setUserEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for user progress & UI control
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState({});

  // State for the submission form
  const [projectLink, setProjectLink] = useState("");
  const [fullyCompleted, setFullyCompleted] = useState("yes");
  const [experience, setExperience] = useState("");
  const [difficulty, setDifficulty] = useState("mid");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchInternshipData = useCallback(async () => {
    if (!loading) setLoading(true);
    try {
      const internshipRes = await axiosInstance.get(`/api/internships/${id}/`);
      const myInternshipsRes = await axiosInstance.get(
        "/api/internships/my-internships/"
      );
      const enrollment = myInternshipsRes.data.find(
        (e) => e.internship.id === parseInt(id)
      );

      if (enrollment) {
        setInternship(internshipRes.data);
        setUserEnrollment(enrollment);
      } else {
        setError("You are not enrolled in this internship.");
      }
    } catch (err) {
      setError("Failed to load internship details.");
    } finally {
      setLoading(false);
    }
  }, [id, loading]);

  useEffect(() => {
    fetchInternshipData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userEnrollment || !internship) return;
    const interval = setInterval(() => {
      const enrollmentDate = new Date(userEnrollment.enrollment_date);
      const endDate = new Date(
        new Date(enrollmentDate).setDate(
          enrollmentDate.getDate() + internship.length_days
        )
      );
      const now = new Date();
      const difference = endDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [userEnrollment, internship]);

  const handleMarkStepComplete = (stepId) => {
    setCompletedSteps((prev) => new Set(prev).add(stepId));
    addNotification("Step marked as complete!");
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        project_link: projectLink,
        fully_completed: fullyCompleted === "yes",
        experience_feedback: experience,
        difficulty_rating: difficulty,
      };
      await axiosInstance.post(
        `/api/internships/my-internships/${userEnrollment.id}/submit/`,
        payload
      );
      addNotification(
        `Project for '${internship.title}' submitted for review.`
      );
      await fetchInternshipData();
    } catch (err) {
      setSubmitError(
        "Submission failed. Please ensure the link is valid and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const learnSteps = useMemo(
    () => internship?.steps.filter((s) => s.step_type === "learn") || [],
    [internship]
  );
  const taskStep = useMemo(
    () => internship?.steps.find((s) => s.step_type === "task"),
    [internship]
  );

  const progressPercentage = useMemo(() => {
    if (!internship) return 0;
    const totalSteps = learnSteps.length + (taskStep ? 1 : 0);
    if (totalSteps === 0) return 0;

    let completedCount = completedSteps.size;
    if (
      userEnrollment?.status === "accepted" ||
      userEnrollment?.status === "awaiting_evaluation"
    ) {
      completedCount = learnSteps.length + 1;
    } else if (userEnrollment?.status === "rejected") {
      completedCount = completedSteps.size;
    }

    return (completedCount / totalSteps) * 100;
    // --- FIX: Added 'internship' to the dependency array ---
  }, [completedSteps, learnSteps, taskStep, userEnrollment, internship]);

  const canSubmit = useMemo(() => {
    if (!userEnrollment || userEnrollment.status !== "in_progress")
      return false;
    return completedSteps.size >= learnSteps.length;
  }, [completedSteps, learnSteps, userEnrollment]);

  if (loading) return <Loader message="Loading Internship..." />;
  if (error)
    return (
      <Container>
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      </Container>
    );
  if (!internship || !userEnrollment) return null;

  // ---- RENDER LOGIC ----
  return (
    <Container className="my-5">
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="mb-2 me-3">{internship.title}</h1>
              <Badge bg="primary" className="fs-6">
                {internship.field}
              </Badge>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="d-flex flex-column align-items-md-end">
                <div className="d-flex align-items-center mb-2">
                  <FaClock className="me-2 text-primary" size={20} />
                  <h5 className="mb-0">Time Remaining</h5>
                </div>
                <div className="countdown-display">
                  <Badge bg="danger" className="fs-5 px-3 py-2">
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
                    {timeLeft.seconds}s
                  </Badge>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col>
              <div className="mb-2">
                <small className="text-muted fw-bold">
                  Overall Progress: {Math.round(progressPercentage)}%
                </small>
              </div>
              <ProgressBar
                now={progressPercentage}
                variant="success"
                striped
                animated
                style={{ height: "8px" }}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {learnSteps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          return (
            <Col md={12} key={step.id}>
              <Card
                className={`shadow-sm border-0 ${
                  isCompleted ? "border-start border-success border-4" : ""
                }`}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className={`rounded-circle p-3 me-3 ${
                        isCompleted ? "bg-success" : "bg-primary"
                      } bg-opacity-10`}
                    >
                      <FaBook
                        size={24}
                        className={
                          isCompleted ? "text-success" : "text-primary"
                        }
                      />
                    </div>
                    <div>
                      <h4 className="mb-1">
                        Step {index + 1}: {step.title}{" "}
                        {isCompleted && (
                          <FaCheckCircle className="text-success ms-2" />
                        )}
                      </h4>
                      <Badge bg={isCompleted ? "success" : "secondary"}>
                        {isCompleted ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                  <div
                    className="step-content mb-4"
                    dangerouslySetInnerHTML={{
                      __html: step.content.replace(/\n/g, "<br />"),
                    }}
                  />
                  <div className="d-flex align-items-center gap-2">
                    {!isCompleted && (
                      <Button
                        variant="primary"
                        onClick={() => handleMarkStepComplete(step.id)}
                      >
                        Mark as Done <FaArrowRight />
                      </Button>
                    )}
                    {step.external_link && (
                      <Button
                        variant="outline-secondary"
                        href={step.external_link}
                        target="_blank"
                      >
                        <FaExternalLinkAlt className="me-2" /> View Resource
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}

        {taskStep && (
          <Col md={12}>
            <Card
              className={`shadow-sm border-0 ${
                userEnrollment.status !== "in_progress"
                  ? "border-start border-success border-4"
                  : ""
              }`}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className={`rounded-circle p-3 me-3 ${
                      userEnrollment.status !== "in_progress"
                        ? "bg-success"
                        : "bg-primary"
                    } bg-opacity-10`}
                  >
                    <FaTasks
                      size={24}
                      className={
                        userEnrollment.status !== "in_progress"
                          ? "text-success"
                          : "text-primary"
                      }
                    />
                  </div>
                  <div>
                    <h4 className="mb-1">Final Step: {taskStep.title}</h4>
                    <Badge
                      bg={
                        userEnrollment.status === "in_progress"
                          ? "secondary"
                          : userEnrollment.status === "awaiting_evaluation"
                          ? "warning"
                          : userEnrollment.status === "accepted"
                          ? "success"
                          : "danger"
                      }
                    >
                      {userEnrollment.status
                        .replace("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                  </div>
                </div>

                {!canSubmit && userEnrollment.status === "in_progress" && (
                  <Alert variant="warning">
                    Please complete all learning steps above to unlock the
                    submission form.
                  </Alert>
                )}

                {userEnrollment.status === "in_progress" && (
                  <Form
                    onSubmit={handleSubmission}
                    className={!canSubmit ? "blurred" : ""}
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>Project Link *</Form.Label>
                      <Form.Control
                        type="url"
                        value={projectLink}
                        onChange={(e) => setProjectLink(e.target.value)}
                        required
                        disabled={!canSubmit}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Did you fully complete the project? *
                      </Form.Label>
                      <div>
                        <Form.Check
                          inline
                          type="radio"
                          label="Yes"
                          name="completed"
                          value="yes"
                          checked={fullyCompleted === "yes"}
                          onChange={(e) => setFullyCompleted(e.target.value)}
                          disabled={!canSubmit}
                        />
                        <Form.Check
                          inline
                          type="radio"
                          label="No"
                          name="completed"
                          value="no"
                          checked={fullyCompleted === "no"}
                          onChange={(e) => setFullyCompleted(e.target.value)}
                          disabled={!canSubmit}
                        />
                      </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Experience Feedback (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="Share your experience..."
                        disabled={!canSubmit}
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label>Difficulty Rating *</Form.Label>
                      <Form.Select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        disabled={!canSubmit}
                      >
                        <option value="easy">😊 Easy</option>
                        <option value="mid">😐 Medium</option>
                        <option value="hard">😓 Hard</option>
                      </Form.Select>
                    </Form.Group>
                    {submitError && (
                      <Alert variant="danger">{submitError}</Alert>
                    )}
                    <Button
                      type="submit"
                      variant="success"
                      size="lg"
                      disabled={!canSubmit || submitting}
                    >
                      {submitting ? "Submitting..." : "Submit for Evaluation"}
                    </Button>
                  </Form>
                )}

                {userEnrollment.status === "awaiting_evaluation" && (
                  <Alert variant="warning" className="mb-0">
                    <Alert.Heading>⏳ Awaiting Evaluation</Alert.Heading>
                    <p className="mb-0">
                      Our team is reviewing your work. You'll be notified of the
                      outcome soon.
                    </p>
                  </Alert>
                )}
                {userEnrollment.status === "rejected" && (
                  <Alert variant="danger" className="mb-0">
                    <Alert.Heading>⚠️ Project Needs Revision</Alert.Heading>
                    <p className="mb-0">
                      <strong>Admin Feedback:</strong>{" "}
                      {userEnrollment.submission?.evaluation_reason ||
                        "No specific feedback was provided."}
                    </p>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}

        {userEnrollment.status === "accepted" && (
          <Col md={12}>
            <Card
              className="shadow-lg border-0 text-white text-center py-5 rounded-4"
              style={{
                background: "linear-gradient(135deg, #007BFF 0%, #0056b3 100%)",
              }}
            >
              <Card.Body>
                <div className="mb-4">
                  <FaTrophy
                    size={100}
                    className="text-warning"
                    style={{
                      filter: "drop-shadow(0 0 15px rgba(255,215,0,0.6))",
                    }}
                  />
                </div>
                <h1 className="display-4 fw-bold mb-3">
                  Achievement Unlocked!
                </h1>
                <h4 className="mb-4 fw-normal">
                  Internship Successfully Completed 🎓
                </h4>
                <p className="lead mb-4">
                  Congratulations on completing{" "}
                  <strong>{internship.title}</strong>! Your hard work has paid
                  off. 🌟
                </p>
                <p className="mb-0">
                  Your official certificate will be sent to your registered
                  email. 📧
                </p>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default InternshipDetailPage;
