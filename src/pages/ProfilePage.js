// src/pages/ProfilePage.js

import React, { useState, useEffect, useCallback } from "react";
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
import { PencilFill, Journals, RocketTakeoff } from "react-bootstrap-icons";
import axiosInstance from "../api/axiosInstance";
import "./ProfilePage.css"; // Ensure you have this stylesheet in the same folder

const ProfilePage = () => {
  const { user, setUser } = useAuth();

  // State for the main profile form
  const [formData, setFormData] = useState({
    full_name: "",
    nationality: "",
    university: "",
    major: "",
    interest: "",
  });

  // State specifically for managing file uploads
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");

  // UI state
  const [loading, setLoading] = useState(true); // Manages the initial page load and saving process
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // State for the internships section
  const [myInternships, setMyInternships] = useState([]);
  const [internshipsLoading, setInternshipsLoading] = useState(true);

  // --- EFFECT 1: Fetch Fresh Profile Data on Load ---
  // This is the CRITICAL fix to ensure data is always up-to-date from the admin panel.
  const fetchProfileData = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/auth/profile/");
      const freshUserData = response.data;
      // Update both the global context and localStorage with the freshest data.
      setUser(freshUserData);
      localStorage.setItem("user", JSON.stringify(freshUserData));
    } catch (err) {
      console.error("Failed to fetch fresh profile data", err);
      setError(
        "Could not load the latest profile data. Displaying cached information."
      );
    } finally {
      setLoading(false); // Stop the main page loader regardless of success or failure.
    }
  }, [setUser]);

  // Run the fetch function once when the page is first visited.
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // --- EFFECT 2: Populate the form AFTER user data is available or updated ---
  // This effect listens for any changes to the global 'user' object.
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        nationality: user.nationality || "", // 'nationality' is directly on the user object.
        university: user.profile?.university || "",
        major: user.profile?.major || "",
        interest: user.profile?.interest || "",
      });
      setPreview(user.profile?.profile_picture);
    }
  }, [user]);

  // --- EFFECT 3: Fetch the user's ongoing internships ---
  useEffect(() => {
    const fetchMyInternships = async () => {
      setInternshipsLoading(true);
      try {
        const response = await axiosInstance.get(
          "/api/internships/my-internships/"
        );
        setMyInternships(response.data);
      } catch (err) {
        console.error("Failed to fetch user's internships", err);
      } finally {
        setInternshipsLoading(false);
      }
    };
    if (user) {
      fetchMyInternships();
    }
  }, [user]); // Run this also when user object is available.

  // --- EVENT HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        // 3 MB check
        setError("File size must be less than 3MB.");
        return;
      }
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
      setError(""); // Clear previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Use the main loader for saving action
    setError("");
    setSuccess("");

    const apiFormData = new FormData();

    // Append fields for the CustomUser model
    apiFormData.append("full_name", formData.full_name);
    apiFormData.append("nationality", formData.nationality);

    // Append fields for the UserProfile model
    apiFormData.append("university", formData.university);
    apiFormData.append("major", formData.major);
    apiFormData.append("interest", formData.interest);

    if (profilePic) {
      apiFormData.append("profile_picture", profilePic);
    }

    try {
      const response = await axiosInstance.put(
        "/api/auth/profile/",
        apiFormData
      );
      setUser(response.data); // Update global context
      localStorage.setItem("user", JSON.stringify(response.data)); // Update local storage
      setSuccess("Profile updated successfully!");
      setIsEditing(false); // Exit editing mode
      setProfilePic(null); // Reset the file state
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- DATA FILTERING ---
  const ongoingInternships = myInternships.filter(
    (e) => e.status === "in_progress" || e.status === "awaiting_evaluation"
  );

  const interests = [
    "Web Development",
    "Mobile App Development",
    "Game Development",
    "Data Science / AI",
    "Cloud & DevOps",
  ];

  // --- INITIAL LOADING STATE ---
  if (loading) {
    return (
      <div
        className="text-center p-5"
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner animation="border" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  // --- RENDER LOGIC ---
  return (
    <div className="profile-page py-5">
      <Container>
        {/* Alerts for feedback */}
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

        {/* Profile Header Card */}
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
              <h1 className="profile-name">{user.full_name || "Your Name"}</h1>
              <p className="profile-email text-muted">{user.email}</p>
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

        {/* Main Profile Information Section */}
        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            <Col md={isEditing ? 6 : 12} lg={isEditing ? 4 : 12}>
              <Card className="info-card h-100">
                <div className="info-label">👤 Full Name</div>
                {isEditing ? (
                  <Form.Control
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Your Full Name"
                  />
                ) : (
                  <div className="info-value">
                    {user.full_name || "Not set"}
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
                    placeholder="Your Nationality"
                  />
                ) : (
                  <div className="info-value">
                    {user.nationality || "Not set"}
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
                    placeholder="Your University"
                  />
                ) : (
                  <div className="info-value">
                    {user.profile?.university || "Not set"}
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
                    placeholder="Your Major"
                  />
                ) : (
                  <div className="info-value">
                    {user.profile?.major || "Not set"}
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
                    {user.profile?.interest || "Not set"}
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Form>

        {/* Ongoing Internships Section */}
        <div className="section-header mt-5">
          <RocketTakeoff size={28} />
          <h2 className="section-title">Ongoing Internships</h2>
        </div>
        {internshipsLoading ? (
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
                        {enrollment.status === "in_progress"
                          ? "In Progress"
                          : "Awaiting Evaluation"}
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
      </Container>
    </div>
  );
};

export default ProfilePage;
