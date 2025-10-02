// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
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

      // --- THE FIX IS HERE ---
      // This logic provides a much cleaner error message to the user.
      let errorMessage = "Registration failed! An unexpected error occurred.";
      if (error.response) {
        // If the backend sent a structured JSON error
        if (
          typeof error.response.data === "object" &&
          error.response.data !== null
        ) {
          // Join validation errors into a single string
          errorMessage = Object.values(error.response.data).flat().join(" ");
        }
        // If the backend sent an HTML error page (like a 500 error)
        else if (
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
    loginAfterVerification,
  };

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
