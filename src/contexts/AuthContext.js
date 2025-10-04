// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";

const baseURL = process.env.REACT_APP_API_BASE_URL;
const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  // Initialize user from localStorage directly to avoid flicker
  const [user, setUser] = useState(() =>
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );
  const [loading, setLoading] = useState(true); // Manages initial app load screen

  const navigate = useNavigate();

  // Your existing login function is correct
  const loginUser = async (email, password) => {
    try {
      const response = await axios.post(`${baseURL}/api/auth/login/`, {
        email,
        password,
      });
      if (response.status === 200) {
        setAuthTokens(response.data);
        localStorage.setItem("authTokens", JSON.stringify(response.data));
        // Fetch fresh user profile right after login
        const userProfileResponse = await axiosInstance.get(
          "/api/auth/profile/"
        );
        const userData = userProfileResponse.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        if (!userData.profile.university || !userData.profile.interest) {
          navigate("/onboarding");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        alert("Login failed! Please check your credentials.");
      }
    }
  };

  // Your existing register function is correct
  const registerUser = async (
    email,
    fullName,
    password,
    password2,
    nationality
  ) => {
    try {
      await axios.post(`${baseURL}/api/auth/register/`, {
        email,
        full_name: fullName,
        password,
        password2,
        nationality,
      });
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
      let errorMessage = "Registration failed! An unexpected error occurred.";
      if (error.response) {
        if (
          typeof error.response.data === "object" &&
          error.response.data !== null
        ) {
          errorMessage = Object.values(error.response.data).flat().join(" ");
        } else if (
          typeof error.response.data === "string" &&
          error.response.data.includes("</html>")
        ) {
          errorMessage =
            "A server error occurred during registration. Please try again later.";
        }
      }
      alert(errorMessage);
    }
  };

  // Your existing post-verification login function is correct
  const loginAfterVerification = (data) => {
    setAuthTokens(data);
    setUser(data.user);
    localStorage.setItem("authTokens", JSON.stringify(data));
    localStorage.setItem("user", JSON.stringify(data.user));

    if (!data.user.profile.university || !data.user.profile.interest) {
      navigate("/onboarding");
    } else {
      navigate("/");
    }
  };

  // --- STEP 1: STABILIZE THE LOGOUT FUNCTION ---
  // We wrap logoutUser in useCallback so its reference doesn't change on every render.
  const logoutUser = useCallback(() => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  // --- STEP 2: THE FIX - A GLOBAL INTERCEPTOR ---
  // This useEffect sets up a "bodyguard" for all API calls made with axiosInstance.
  useEffect(() => {
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response, // Pass through successful responses
      (error) => {
        // Check for the specific 401 Unauthorized error
        if (error.response && error.response.status === 401) {
          console.log("Token expired or invalid. Logging out...");
          logoutUser(); // This triggers our global logout and redirects to login
        }
        // For all other errors, just let them be handled by the component that made the call
        return Promise.reject(error);
      }
    );

    // This is a "cleanup" function that runs when the AuthProvider unmounts.
    // It removes the interceptor to prevent memory leaks.
    return () => {
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [logoutUser]); // This effect correctly depends on our stable logoutUser function.

  // This useEffect simply manages the initial loading screen of the app.
  useEffect(() => {
    setLoading(false);
  }, []);

  const contextData = {
    user,
    setUser,
    authTokens,
    setAuthTokens,
    loginUser,
    logoutUser,
    registerUser,
    loginAfterVerification,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
