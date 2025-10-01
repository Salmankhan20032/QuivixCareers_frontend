// src/api/axiosInstance.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

const baseURL = process.env.REACT_APP_API_BASE_URL;

let authTokens = localStorage.getItem("authTokens")
  ? JSON.parse(localStorage.getItem("authTokens"))
  : null;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${authTokens?.access}`,
  },
});

axiosInstance.interceptors.request.use(async (req) => {
  authTokens = localStorage.getItem("authTokens")
    ? JSON.parse(localStorage.getItem("authTokens"))
    : null;

  if (authTokens) {
    req.headers.Authorization = `Bearer ${authTokens?.access}`;
    const user = jwtDecode(authTokens.access);
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

    if (!isExpired) return req;

    try {
      const response = await axios.post(`${baseURL}/api/auth/login/refresh/`, {
        refresh: authTokens.refresh,
      });
      localStorage.setItem("authTokens", JSON.stringify(response.data));
      req.headers.Authorization = `Bearer ${response.data.access}`;
      return req;
    } catch (error) {
      // Handle refresh token failure (e.g., redirect to login)
      console.error("Refresh token failed", error);
      // You might want to trigger a logout action here
    }
  }
  return req;
});

export default axiosInstance;
