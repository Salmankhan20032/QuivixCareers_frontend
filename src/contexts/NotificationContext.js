// src/contexts/NotificationContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axiosInstance from "../api/axiosInstance"; // We'll use our secure axios instance
import useAuth from "../hooks/useAuth"; // We need to know who the user is

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth(); // Get the current logged-in user

  // This function will fetch notifications from our new API
  const fetchNotifications = useCallback(async () => {
    if (user) {
      // Only fetch if a user is logged in
      try {
        const response = await axiosInstance.get("/api/notifications/");
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    } else {
      // If there is no user, clear any existing notifications
      setNotifications([]);
    }
  }, [user]);

  // Use useEffect to fetch notifications when the component mounts or when the user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // This function is now only for adding temporary, client-side notifications
  // for immediate feedback (e.g., "Intro Marked as Done"). These will NOT be saved.
  const addNotification = (message) => {
    const localNotification = {
      id: `local-${Math.random()}`, // Use a temporary ID
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    // Add the local notification to the top of the list
    setNotifications((prev) => [localNotification, ...prev]);
  };

  // This function now calls our new API endpoint
  const markAllAsRead = async () => {
    try {
      await axiosInstance.post("/api/notifications/mark-all-read/");
      // After successfully updating the backend, update the frontend state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const value = {
    notifications,
    addNotification,
    markAllAsRead,
    unreadCount,
    fetchNotifications, // Expose this so we can manually refresh if needed
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
