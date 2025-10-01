// src/pages/InternshipDetailPage.js

import React, { useState, useEffect, useCallback } from "react";
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
  FaPlayCircle,
  FaBook,
  FaMap,
  FaTasks,
  FaTrophy,
  FaCheckCircle,
  FaClock,
  FaStar,
} from "react-icons/fa";

// Hardcoded content as requested
const fieldInfo = {
  "Web Development":
    "Introduction to HTML, CSS, JavaScript, and a popular framework like React. Understand the client-server model and build your first web application.",
  "Mobile App Development":
    "Learn the fundamentals of mobile development for either Android (Kotlin) or iOS (Swift), or cross-platform with Flutter. Focus on UI/UX and native features.",
  "Data Science / AI":
    "Dive into Python with libraries like Pandas, NumPy, and Scikit-learn. Understand data cleaning, analysis, and build a simple machine learning model.",
  Default:
    "Welcome to your internship! This introduction will cover the basic concepts and tools you'll be using throughout this program.",
};

const roadmapInfo = {
  "Web Development":
    "Week 1: HTML/CSS. Week 2: JavaScript Basics. Week 3: React Fundamentals. Week 4: Final Project Build.",
  "Mobile App Development":
    "Week 1: UI/UX Design Basics. Week 2: State Management Concepts. Week 3: API Integration. Week 4: Final Project Build.",
  "Data Science / AI":
    "Week 1: Python & Pandas for Data Manipulation. Week 2: Data Visualization with Matplotlib. Week 3: Intro to Machine Learning models. Week 4: Final Project Build.",
  Default:
    "Your journey will be divided into several phases, starting from basics to advanced topics, culminating in a final project submission.",
};

const InternshipDetailPage = () => {
  const { id } = useParams();
  const { addNotification } = useNotifications();

  const [internship, setInternship] = useState(null);
  const [userEnrollment, setUserEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [started, setStarted] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [roadmapDone, setRoadmapDone] = useState(false);

  const [timeLeft, setTimeLeft] = useState({});
  const [projectLink, setProjectLink] = useState("");
  const [fullyCompleted, setFullyCompleted] = useState("yes");
  const [experience, setExperience] = useState("");
  const [difficulty, setDifficulty] = useState("mid");

  const fetchInternshipData = useCallback(async () => {
    setLoading(true);
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
        setStarted(enrollment.is_started);
        setIntroDone(enrollment.intro_completed);
        setRoadmapDone(enrollment.roadmap_completed);
      } else {
        setError("You are not enrolled in this internship.");
      }
    } catch (err) {
      setError("Failed to load internship details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInternshipData();
  }, [fetchInternshipData]);

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

  const updateProgress = async (progressData) => {
    if (!userEnrollment) return;
    try {
      await axiosInstance.patch(
        `/api/internships/my-internships/${userEnrollment.id}/progress/`,
        progressData
      );
    } catch (err) {
      addNotification("Error: Could not save your progress.", {
        type: "error",
      });
    }
  };

  const handleStartInternship = () => {
    setStarted(true);
    updateProgress({ is_started: true });
  };

  const handleMarkIntroDone = () => {
    setIntroDone(true);
    addNotification(`'${internship.title}' - Introduction completed!`);
    updateProgress({ intro_completed: true });
  };

  const handleMarkRoadmapDone = () => {
    setRoadmapDone(true);
    addNotification(`'${internship.title}' - Roadmap reviewed!`);
    updateProgress({ roadmap_completed: true });
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      setError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const introText = fieldInfo[internship.field] || fieldInfo.Default;
  const roadmapText = roadmapInfo[internship.field] || roadmapInfo.Default;

  // Calculate progress
  const calculateProgress = () => {
    let completed = 0;
    let total = 3;
    if (introDone) completed++;
    if (roadmapDone) completed++;
    if (
      userEnrollment.status === "accepted" ||
      userEnrollment.status === "awaiting_evaluation"
    )
      completed++;
    return (completed / total) * 100;
  };

  return (
    <Container className="my-5">
      {/* Header Section */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center mb-2">
                <h1 className="mb-0 me-3">{internship.title}</h1>
                <Badge bg="primary" className="fs-6">
                  {internship.field}
                </Badge>
              </div>
              <p className="lead text-muted mb-0">{internship.description}</p>
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
                  Overall Progress: {Math.round(calculateProgress())}%
                </small>
              </div>
              <ProgressBar
                now={calculateProgress()}
                variant="success"
                striped
                animated
                style={{ height: "8px" }}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Start Internship Card */}
      {!started && (
        <Card className="shadow-sm border-0 text-center py-5">
          <Card.Body>
            <FaPlayCircle size={80} className="text-primary mb-4" />
            <h2>Ready to Begin Your Journey?</h2>
            <p className="text-muted mb-4">
              Click the button below to unlock all internship steps and start
              learning.
            </p>
            <Button size="lg" variant="primary" onClick={handleStartInternship}>
              <FaPlayCircle className="me-2" />
              Start Internship
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Progress Cards */}
      {started && (
        <Row className="g-4">
          {/* Step 1: Introduction */}
          <Col md={12}>
            <Card
              className={`shadow-sm border-0 ${
                introDone ? "border-start border-success border-4" : ""
              }`}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center">
                    <div
                      className={`rounded-circle p-3 me-3 ${
                        introDone ? "bg-success" : "bg-primary"
                      } bg-opacity-10`}
                    >
                      <FaBook
                        size={24}
                        className={introDone ? "text-success" : "text-primary"}
                      />
                    </div>
                    <div>
                      <h4 className="mb-1">
                        Step 1: Introduction{" "}
                        {introDone && (
                          <FaCheckCircle className="text-success ms-2" />
                        )}
                      </h4>
                      <Badge bg={introDone ? "success" : "secondary"}>
                        {introDone ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Card.Text className="text-muted mb-4">{introText}</Card.Text>
                <Button
                  variant={introDone ? "outline-success" : "primary"}
                  disabled={introDone}
                  onClick={handleMarkIntroDone}
                >
                  {introDone ? (
                    <>
                      <FaCheckCircle className="me-2" /> Completed
                    </>
                  ) : (
                    "Mark as Done"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Step 2: Roadmap */}
          <Col md={12}>
            <Card
              className={`shadow-sm border-0 ${
                roadmapDone ? "border-start border-success border-4" : ""
              }`}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center">
                    <div
                      className={`rounded-circle p-3 me-3 ${
                        roadmapDone ? "bg-success" : "bg-primary"
                      } bg-opacity-10`}
                    >
                      <FaMap
                        size={24}
                        className={
                          roadmapDone ? "text-success" : "text-primary"
                        }
                      />
                    </div>
                    <div>
                      <h4 className="mb-1">
                        Step 2: Learning Roadmap{" "}
                        {roadmapDone && (
                          <FaCheckCircle className="text-success ms-2" />
                        )}
                      </h4>
                      <Badge bg={roadmapDone ? "success" : "secondary"}>
                        {roadmapDone ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <ul className="list-unstyled">
                    {roadmapText.split(". ").map(
                      (item, i) =>
                        item && (
                          <li key={i} className="mb-2">
                            <FaStar className="text-warning me-2" />
                            <span className="text-muted">{item}</span>
                          </li>
                        )
                    )}
                  </ul>
                </div>
                <Button
                  variant={roadmapDone ? "outline-success" : "primary"}
                  disabled={roadmapDone}
                  onClick={handleMarkRoadmapDone}
                >
                  {roadmapDone ? (
                    <>
                      <FaCheckCircle className="me-2" /> Completed
                    </>
                  ) : (
                    "Mark as Done"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Step 3: Tasks & Submission */}
          <Col md={12}>
            <Card
              className={`shadow-sm border-0 ${
                userEnrollment.status !== "in_progress"
                  ? "border-start border-success border-4"
                  : ""
              }`}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center">
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
                      <h4 className="mb-1">
                        Step 3: Tasks & Project Submission
                      </h4>
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
                        {userEnrollment.status === "in_progress"
                          ? "In Progress"
                          : userEnrollment.status === "awaiting_evaluation"
                          ? "Under Review"
                          : userEnrollment.status === "accepted"
                          ? "Accepted"
                          : "Needs Revision"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {userEnrollment.status === "in_progress" && (
                  <>
                    <h5 className="mb-3">📋 Your Tasks</h5>
                    {internship.tasks.length > 0 ? (
                      <ul className="mb-4">
                        {internship.tasks.map((task) => (
                          <li key={task.id} className="mb-2">
                            <strong>{task.title}:</strong>{" "}
                            <span className="text-muted">
                              {task.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Alert variant="info" className="mb-4">
                        No specific tasks listed. Follow the roadmap and general
                        instructions to complete your project.
                      </Alert>
                    )}

                    <hr className="my-4" />

                    <h5 className="mb-3">📤 Submit Your Project</h5>
                    <Form onSubmit={handleSubmission}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Project Link (GitHub, Vercel, Live Demo, etc.) *
                        </Form.Label>
                        <Form.Control
                          type="url"
                          value={projectLink}
                          onChange={(e) => setProjectLink(e.target.value)}
                          placeholder="https://github.com/your-username/your-project"
                          required
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
                          />
                          <Form.Check
                            inline
                            type="radio"
                            label="No"
                            name="completed"
                            value="no"
                            checked={fullyCompleted === "no"}
                            onChange={(e) => setFullyCompleted(e.target.value)}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          Your Experience Feedback (Optional)
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="Share your experience with this internship..."
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Difficulty Rating *</Form.Label>
                        <Form.Select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                        >
                          <option value="easy">😊 Easy</option>
                          <option value="mid">😐 Medium</option>
                          <option value="hard">😓 Hard</option>
                        </Form.Select>
                      </Form.Group>

                      <Button type="submit" variant="success" size="lg">
                        Submit for Evaluation
                      </Button>
                    </Form>
                  </>
                )}

                {userEnrollment.status === "awaiting_evaluation" && (
                  <Alert variant="warning" className="mb-0">
                    <Alert.Heading>⏳ Awaiting Evaluation</Alert.Heading>
                    <p className="mb-0">
                      Your project has been submitted successfully! Our team is
                      reviewing your work. You'll be notified of the outcome
                      soon.
                    </p>
                  </Alert>
                )}

                {userEnrollment.status === "accepted" && (
                  <Alert variant="success" className="mb-0">
                    <Alert.Heading color="green">
                      🎉 Congratulations! Project Accepted
                    </Alert.Heading>

                    <p className="mb-0">
                      Your project has been approved! Your certificate will be
                      sent to your registered email address shortly.
                    </p>
                  </Alert>
                )}

                {userEnrollment.status === "rejected" && (
                  <Alert variant="danger" className="mb-0">
                    <Alert.Heading>⚠️ Project Needs Revision</Alert.Heading>
                    <p>
                      Your submission requires some improvements. Please review
                      the feedback below and consider resubmitting.
                    </p>
                    <hr />
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

          {/* Achievement Trophy Card */}
          {userEnrollment.status === "accepted" && (
            <Col md={12}>
              <Card
                className="shadow-lg border-0 text-white text-center py-5 rounded-4"
                style={{
                  background:
                    "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
                }}
              >
                <Card.Body>
                  {/* Trophy Icon */}
                  <div className="mb-4">
                    <FaTrophy
                      size={110}
                      className="text-warning"
                      style={{
                        filter: "drop-shadow(0 0 25px rgba(255,215,0,0.7))",
                      }}
                    />
                  </div>

                  {/* Main Title */}
                  <h1 className="display-4 fw-bold mb-3">
                    🎉 Achievement Unlocked!
                  </h1>

                  {/* Subtitle */}
                  <h4 className="mb-4 fw-semibold">
                    Internship Successfully Completed 🎓
                  </h4>

                  {/* Message */}
                  <p className="lead mb-4">
                    Congratulations on completing{" "}
                    <strong>{internship.title}</strong>! Your commitment,
                    passion, and hard work have truly paid off. 🌟
                  </p>

                  {/* Badges Row */}
                  <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                    <Badge
                      bg="light"
                      text="dark"
                      className="px-4 py-2 fs-5 rounded-pill shadow-sm"
                    >
                      <FaCheckCircle className="me-2 text-success" />
                      Certified Graduate
                    </Badge>
                    <Badge
                      bg="warning"
                      text="dark"
                      className="px-4 py-2 fs-5 rounded-pill shadow-sm"
                    >
                      🏆 Excellence
                    </Badge>
                  </div>

                  {/* Footer Note */}
                  <p className="mb-0 fs-5">
                    Your official certificate has been sent to your email inbox.
                    📧 Keep shining and achieving more! 🚀
                  </p>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
};

export default InternshipDetailPage;
