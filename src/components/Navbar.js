import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useNotifications } from "../contexts/NotificationContext";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  Container,
  Image,
  Badge,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import { PersonCircle, BellFill, Search } from "react-bootstrap-icons";
import axiosInstance from "../api/axiosInstance";
import "./Navbar.css";

// --- Custom hook to detect screen size for responsive rendering ---
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

const AppNavbar = () => {
  const { user, logoutUser } = useAuth();
  const { notifications, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);

  const isMobile = useMediaQuery("(max-width: 991px)");

  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const response = await axiosInstance.get(
          `/api/internships/?search=${encodeURIComponent(searchQuery)}`
        );
        setSuggestions(response.data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch search suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(fetchSuggestions, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setNavExpanded(false);
    setShowSearch(false);
  }, [location]);

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        setSuggestions([]);
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchQuery("");
        setShowSearch(false);
        setNavExpanded(false);
      }
    },
    [searchQuery, navigate]
  );

  const handleSuggestionClick = useCallback(
    (internshipId) => {
      setSuggestions([]);
      setSearchQuery("");
      setShowSearch(false);
      setNavExpanded(false);
      navigate(`/internship/${internshipId}`);
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    logoutUser();
    navigate("/login");
    setNavExpanded(false);
  }, [logoutUser, navigate]);

  const toggleMobileSearch = useCallback(() => {
    setShowSearch((prev) => !prev);
    setNavExpanded(false);
  }, []);

  const toggleNav = useCallback(() => {
    setNavExpanded((prev) => !prev);
    setShowSearch(false);
  }, []);

  const getNotificationStatusClass = (message) => {
    const lowerCaseMessage = message.toLowerCase();
    if (lowerCaseMessage.includes("rejected")) {
      return "status-rejected";
    }
    if (lowerCaseMessage.includes("congratulations")) {
      return "status-success";
    }
    return "";
  };

  const isActive = (path) => location.pathname === path;

  const renderSearchForm = (isMobile = false) => (
    <Form className="search-form" onSubmit={handleSearchSubmit}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <Form.Control
          type="search"
          placeholder="Search internships..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
          autoFocus={isMobile}
          aria-label="Search internships"
        />
      </div>
    </Form>
  );

  const renderSuggestions = () => (
    <ListGroup className="suggestions-dropdown">
      {isSearching && (
        <ListGroup.Item className="suggestion-item text-center">
          <Spinner size="sm" animation="border" variant="primary" />
        </ListGroup.Item>
      )}
      {!isSearching &&
        suggestions.length > 0 &&
        suggestions.map((s) => (
          <ListGroup.Item
            action
            key={s.id}
            onClick={() => handleSuggestionClick(s.id)}
            className="suggestion-item"
          >
            <Search size={14} className="me-2 text-muted" />
            <span>{s.title}</span>
          </ListGroup.Item>
        ))}
      {!isSearching && suggestions.length === 0 && searchQuery && (
        <ListGroup.Item className="suggestion-item text-muted text-center">
          No results for "{searchQuery}"
        </ListGroup.Item>
      )}
    </ListGroup>
  );

  return (
    <>
      <Navbar expand="lg" expanded={navExpanded} className="modern-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand-container">
            <img src="/logo.png" alt="Quivix Logo" className="navbar-logo" />
            <span className="brand-text">QuivixCareers</span>
          </Navbar.Brand>

          <div className="navbar-actions-mobile d-lg-none">
            <Button
              variant="link"
              className="search-toggle-btn"
              onClick={toggleMobileSearch}
              aria-label="Toggle search"
              aria-expanded={showSearch}
            >
              <Search size={20} />
            </Button>
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              onClick={toggleNav}
            />
          </div>

          <Navbar.Collapse id="basic-navbar-nav">
            <div className="main-nav-content">
              <Nav className="nav-links">
                <Nav.Link
                  as={Link}
                  to="/"
                  className={`nav-item-custom ${isActive("/") ? "active" : ""}`}
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/internships"
                  className={`nav-item-custom ${
                    isActive("/internships") ? "active" : ""
                  }`}
                >
                  Internships
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/about"
                  className={`nav-item-custom ${
                    isActive("/about") ? "active" : ""
                  }`}
                >
                  About
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/contact"
                  className={`nav-item-custom ${
                    isActive("/contact") ? "active" : ""
                  }`}
                >
                  Contact
                </Nav.Link>
              </Nav>

              <div
                ref={searchContainerRef}
                className="search-container d-none d-lg-flex"
              >
                {renderSearchForm()}
                {searchQuery && renderSuggestions()}
              </div>

              {user ? (
                <Nav className="user-actions">
                  <NavDropdown
                    title={
                      isMobile ? (
                        <>
                          <BellFill size={20} className="me-2" />
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <Badge pill bg="danger" className="ms-auto">
                              {unreadCount}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <div className="notification-icon-wrapper">
                          <BellFill size={20} />
                          {unreadCount > 0 && (
                            <Badge
                              pill
                              bg="danger"
                              className="notification-badge"
                            >
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                          )}
                        </div>
                      )
                    }
                    id="notification-dropdown"
                    align="end"
                    className="notification-dropdown"
                  >
                    <div className="notification-header">
                      <strong>Notifications</strong>
                      {unreadCount > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={markAllAsRead}
                          className="mark-read-btn"
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <NavDropdown.Divider className="m-0" />
                    <div className="notification-list">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <NavDropdown.Item
                            key={n.id}
                            className={`notification-item ${
                              !n.is_read ? "unread" : ""
                            } ${getNotificationStatusClass(n.message)}`}
                          >
                            <div className="notification-message">
                              {n.message}
                            </div>
                            <div className="notification-time">
                              {new Date(n.created_at).toLocaleString()}
                            </div>
                          </NavDropdown.Item>
                        ))
                      ) : (
                        <div className="no-notifications">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </NavDropdown>

                  <NavDropdown
                    title={
                      isMobile ? (
                        <>
                          {user.profile?.profile_picture ? (
                            <Image
                              src={user.profile.profile_picture}
                              className="mobile-profile-img me-2"
                            />
                          ) : (
                            <PersonCircle size={24} className="me-2" />
                          )}
                          <span>{user.full_name || "Profile"}</span>
                        </>
                      ) : (
                        <div className="profile-icon-wrapper">
                          {user.profile?.profile_picture ? (
                            <Image
                              src={user.profile.profile_picture}
                              className="profile-image"
                              alt={user.full_name || "Profile"}
                            />
                          ) : (
                            <PersonCircle
                              size={24}
                              className="profile-placeholder"
                            />
                          )}
                        </div>
                      )
                    }
                    id="profile-dropdown"
                    align="end"
                    className="profile-dropdown"
                  >
                    <div className="profile-header">
                      <strong>{user.full_name || "User"}</strong>
                      <small>{user.email}</small>
                    </div>
                    <NavDropdown.Divider className="m-0" />
                    <NavDropdown.Item
                      as={Link}
                      to="/profile"
                      className="dropdown-item-custom"
                    >
                      My Profile
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      as={Link}
                      to="/settings"
                      className="dropdown-item-custom"
                    >
                      Settings
                    </NavDropdown.Item>
                    <NavDropdown.Divider className="m-0" />
                    <NavDropdown.Item
                      onClick={handleLogout}
                      className="dropdown-item-custom logout-item"
                    >
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </Nav>
              ) : (
                <Nav className="auth-actions">
                  <Button
                    as={Link}
                    to="/login"
                    variant="outline-primary"
                    className="login-btn"
                  >
                    Login
                  </Button>
                  <Button as={Link} to="/register" className="register-btn">
                    Register
                  </Button>
                </Nav>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {showSearch && (
        <div className="mobile-search-overlay">
          <Container>
            <div
              ref={mobileSearchContainerRef}
              className="mobile-search-container"
            >
              {renderSearchForm(true)}
              {searchQuery && renderSuggestions()}
            </div>
          </Container>
        </div>
      )}
    </>
  );
};

export default AppNavbar;
