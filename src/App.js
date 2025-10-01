// src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// CONTEXT PROVIDERS
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// ROUTING UTILITIES
import PrivateRoute from "./utils/PrivateRoute";

// We need the useAuth hook here to check if a user is logged in
import useAuth from "./hooks/useAuth";

// CORE COMPONENTS
import AppNavbar from "./components/Navbar";
import FloatingAIButton from "./components/FloatingAIButton";
import Footer from "./components/Footer"; // <-- 1. IMPORT THE NEW FOOTER

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

// We must wrap the logic in a small component because hooks can only be called inside components.
const AppContent = () => {
  // Get the user object from our authentication context
  const { user } = useAuth();

  return (
    // <-- 2. ADD A WRAPPER DIV FOR PROPER FOOTER PLACEMENT -->
    <div className="app-container">
      <AppNavbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected Routes (require login) */}
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
      {/* This is the new, correct way. It simply checks if a user exists.
          If 'user' is an object, it's true, and the button will be rendered.
          If 'user' is null, it's false, and nothing will be rendered. */}
      {user && <FloatingAIButton />}
      <Footer /> {/* <-- 3. ADD THE FOOTER COMPONENT HERE --> */}
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
