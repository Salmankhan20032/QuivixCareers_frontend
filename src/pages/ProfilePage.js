// src/pages/ProfilePage.js

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Image,
  Badge,
} from "react-bootstrap";
import {
  PencilFill,
  Journals,
  RocketTakeoff,
  TrophyFill,
  Download,
} from "react-bootstrap-icons";
import axiosInstance from "../api/axiosInstance";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    nationality: "",
    university: "",
    major: "",
    interest: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [myInternships, setMyInternships] = useState([]);

  // Fetch profile and internships data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, internshipsRes] = await Promise.all([
          axiosInstance.get("/api/auth/profile/"),
          axiosInstance.get("/api/internships/my-internships/"),
        ]);
        setUser(profileRes.data);
        localStorage.setItem("user", JSON.stringify(profileRes.data));
        setMyInternships(internshipsRes.data);
      } catch (err) {
        setError("Could not load profile data.");
        console.error("Failed to fetch page data", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  // Populate form when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        nationality: user.nationality || "",
        university: user.profile?.university || "",
        major: user.profile?.major || "",
        interest: user.profile?.interest || "",
      });
      setPreview(user.profile?.profile_picture);
    }
  }, [user]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError("File size must be less than 3MB.");
        return;
      }
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const apiFormData = new FormData();
    Object.keys(formData).forEach((key) =>
      apiFormData.append(key, formData[key])
    );
    if (profilePic) apiFormData.append("profile_picture", profilePic);
    try {
      const response = await axiosInstance.put(
        "/api/auth/profile/",
        apiFormData
      );
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setProfilePic(null);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ongoingInternships = useMemo(
    () =>
      myInternships.filter(
        (e) => e.status === "in_progress" || e.status === "awaiting_evaluation"
      ),
    [myInternships]
  );

  const completedInternships = useMemo(
    () => myInternships.filter((e) => e.status === "accepted"),
    [myInternships]
  );

  const interests = [
    "Web Development",
    "Mobile App Development",
    "Game Development",
    "Data Science / AI",
    "Cloud & DevOps",
  ];

  if (loading && !myInternships.length) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  return (
    <div className="profile-page py-5">
      <Container>
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={() => setSuccess("")} dismissible>
            {success}
          </Alert>
        )}
        <Card className="profile-header-card mb-4">
          <Row className="align-items-center">
            <Col md={3} className="text-center mb-4 mb-md-0">
              <div className="profile-avatar-wrapper">
                <Image
                  src={preview || "/default-avatar.png"}
                  className="profile-avatar"
                />
                {isEditing && (
                  <label className="edit-avatar-btn">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      hidden
                    />
                    <PencilFill size={18} />
                  </label>
                )}
              </div>
            </Col>
            <Col md={9}>
              <h1 className="profile-name">{user?.full_name || "Your Name"}</h1>
              <p className="profile-email text-muted">{user?.email}</p>
              {!isEditing ? (
                <Button
                  className="action-btn"
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                >
                  <PencilFill className="me-2" /> Edit Profile
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button
                    className="action-btn"
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" as="span" /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    className="action-btn"
                    variant="outline-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Card>
        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            <Col md={6} lg={4}>
              <Card className="info-card h-100">
                <div className="info-label">👤 Full Name</div>
                {isEditing ? (
                  <Form.Control
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="info-value">
                    {user?.full_name || "Not set"}
                  </div>
                )}
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="info-card h-100">
                <div className="info-label">🌍 Nationality</div>
                {isEditing ? (
                  <Form.Control
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="info-value">
                    {user?.nationality || "Not set"}
                  </div>
                )}
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="info-card h-100">
                <div className="info-label">🎓 University</div>
                {isEditing ? (
                  <Form.Control
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="info-value">
                    {user?.profile?.university || "Not set"}
                  </div>
                )}
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="info-card h-100">
                <div className="info-label">📚 Major</div>
                {isEditing ? (
                  <Form.Control
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="info-value">
                    {user?.profile?.major || "Not set"}
                  </div>
                )}
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="info-card h-100">
                <div className="info-label">💡 Interest</div>
                {isEditing ? (
                  <Form.Select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                  >
                    <option value="">Select an interest</option>
                    {interests.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <div className="info-value">
                    {user?.profile?.interest || "Not set"}
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Form>
        <div className="section-header mt-5">
          <RocketTakeoff size={28} />
          <h2 className="section-title">Ongoing Internships</h2>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : ongoingInternships.length > 0 ? (
          <Row className="g-4">
            {ongoingInternships.map((enrollment) => (
              <Col md={6} lg={4} key={enrollment.id}>
                <Card className="profile-internship-card h-100 shadow-sm">
                  <Card.Img
                    src={enrollment.internship.thumbnail}
                    className="internship-thumbnail"
                  />
                  <Card.Body className="d-flex flex-column internship-body">
                    <h3 className="internship-title flex-grow-1">
                      {enrollment.internship.title}
                    </h3>
                    <div className="mb-3">
                      <Badge
                        pill
                        bg={
                          enrollment.status === "in_progress"
                            ? "primary"
                            : "warning"
                        }
                        className="status-badge"
                      >
                        {enrollment.status
                          .replace("_", " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Badge>
                    </div>
                    <Button
                      as={Link}
                      to={`/internship/${enrollment.internship.id}`}
                      variant="primary"
                      className="w-100 action-btn"
                    >
                      Continue Learning
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="empty-state text-center py-5">
            <div className="empty-icon mb-3">
              <Journals size={48} className="text-muted" />
            </div>
            <h3>No Active Internships</h3>
            <p className="text-muted mb-4">
              Start your learning journey by exploring available opportunities.
            </p>
            <Button
              as={Link}
              to="/internships"
              variant="primary"
              className="action-btn"
            >
              Explore Internships
            </Button>
          </div>
        )}
        <div className="section-header mt-5">
          <TrophyFill size={28} />
          <h2 className="section-title">Completed Programs & Achievements</h2>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : completedInternships.length > 0 ? (
          <Row className="g-4">
            {completedInternships.map((enrollment) => (
              <Col md={6} lg={4} key={enrollment.id}>
                <Card className="profile-internship-card completed-card h-100 shadow-sm">
                  <Card.Img
                    src={enrollment.internship.thumbnail}
                    className="internship-thumbnail"
                  />
                  <Card.Body className="d-flex flex-column internship-body">
                    <h3 className="internship-title flex-grow-1">
                      {enrollment.internship.title}
                    </h3>
                    <div className="mb-3">
                      <Badge pill bg="success" className="status-badge">
                        <TrophyFill className="me-1" /> Completed
                      </Badge>
                    </div>
                    <Button
                      variant="outline-success"
                      className="w-100 action-btn"
                      onClick={() =>
                        alert("Certificate download feature coming soon!")
                      }
                    >
                      <Download className="me-2" /> Download Certificate
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="empty-state text-center py-5">
            <div className="empty-icon mb-3">
              <TrophyFill size={48} className="text-muted" />
            </div>
            <h3>No Completed Internships Yet</h3>
            <p className="text-muted mb-4">
              Finish one of your ongoing programs to see your achievements here.
              Keep going!
            </p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProfilePage;
