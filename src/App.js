// src/App.js

import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

// CONTEXT PROVIDERS
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// ROUTING UTILITIES
import PrivateRoute from "./utils/PrivateRoute";
import useAuth from "./hooks/useAuth";

// CORE COMPONENTS
import AppNavbar from "./components/Navbar";
import FloatingAIButton from "./components/FloatingAIButton";
import Footer from "./components/Footer";

// PAGE COMPONENTS
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import OnboardingPage from "./pages/OnboardingPage";
import InternshipDetailPage from "./pages/InternshipDetailPage";
import InternshipsListPage from "./pages/InternshipsListPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SearchPage from "./pages/SearchPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BlazeAIPage from "./pages/BlazeAIPage";

// GLOBAL STYLES
import "./App.css";

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();

  // --- ADD BLAZE AI TO THIS LIST ---
  // These pages will have a focused, full-screen layout.
  const pagesWithoutLayout = [
    "/login",
    "/register",
    "/verify-otp",
    "/onboarding",
    "/blaze-ai", // Add the Blaze AI page here
  ];

  const showLayout = !pagesWithoutLayout.includes(location.pathname);

  return (
    <div className="app-container">
      {showLayout && <AppNavbar />}

      <main className={showLayout ? "" : "full-page-content"}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/internships" element={<InternshipsListPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/internship/:id" element={<InternshipDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/blaze-ai" element={<BlazeAIPage />} />
          </Route>
        </Routes>
      </main>

      {/* Show floating AI button only on layout pages and when logged in */}
      {showLayout && user && <FloatingAIButton />}

      {showLayout && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
