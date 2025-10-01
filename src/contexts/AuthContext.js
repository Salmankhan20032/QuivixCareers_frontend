// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../api/axiosInstance"; // <-- IMPORT our configured axios instance

const baseURL = process.env.REACT_APP_API_BASE_URL;
const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // This function is for standard login for already verified users
  const loginUser = async (email, password) => {
    try {
      const response = await axios.post(`${baseURL}/api/auth/login/`, {
        email,
        password,
      });
      if (response.status === 200) {
        setAuthTokens(response.data);
        localStorage.setItem("authTokens", JSON.stringify(response.data));

        const userProfileResponse = await axiosInstance.get(
          "/api/auth/profile/"
        );
        const userData = userProfileResponse.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        // Check if the user needs onboarding
        if (!userData.profile.university || !userData.profile.interest) {
          navigate("/onboarding");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response && error.response.data.detail) {
        alert(error.response.data.detail); // Show specific error from backend
      } else {
        alert("Login failed! Please check your credentials.");
      }
    }
  };

  // This function is for initial registration, which now leads to OTP verification
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
      // --- NEW BEHAVIOR ---
      // On successful registration, go to the OTP page
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
      alert(
        "Registration failed! " +
          JSON.stringify(error.response?.data || "An error occurred.")
      );
    }
  };

  // --- NEW FUNCTION TO LOG IN AFTER SUCCESSFUL OTP VERIFICATION ---
  const loginAfterVerification = (data) => {
    setAuthTokens(data);
    setUser(data.user); // The user object is now sent back from our verify view
    localStorage.setItem("authTokens", JSON.stringify(data));
    localStorage.setItem("user", JSON.stringify(data.user));

    // We also run the onboarding check here
    if (!data.user.profile.university || !data.user.profile.interest) {
      navigate("/onboarding");
    } else {
      navigate("/");
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const contextData = {
    user,
    setUser,
    authTokens,
    loginUser,
    logoutUser,
    registerUser,
    loginAfterVerification, // Expose the new function
  };

  // This useEffect will run on app load to check if the user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (authTokens && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [authTokens]);

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
