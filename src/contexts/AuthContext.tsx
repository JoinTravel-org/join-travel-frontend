import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import authService from "../services/auth.service";
import socketService from "../services/socket.service";
import apiService from "../services/api.service";
import type { User, UserStats } from "../types/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  forceLogout: () => void;
  accessToken: string | null;
  updateUserStats: (stats: UserStats) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored tokens on app load
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    // Function to validate tokens synchronously
    const validateTokens = async () => {
      if (!storedAccessToken || !storedRefreshToken || !storedUser) {
        // Clear any partial auth state
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser.id || parsedUser.id === 'undefined') {
        // Invalid user data, clear auth state
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        return;
      }

      try {
        // First, try to validate the access token with a simple API call
        const decodedToken = JSON.parse(atob(storedAccessToken.split('.')[1]));
        if (!decodedToken.id || decodedToken.id === 'undefined') {
          throw new Error('Invalid token: missing user ID');
        }
        await apiService.getUserStats(decodedToken.id);
        // If successful, tokens are valid, restore session
        setAccessToken(storedAccessToken);
        setUser(parsedUser);
        socketService.connect(storedAccessToken);
      } catch (accessTokenError) {
        // Access token is invalid, try refresh token
        try {
          const refreshResponse = await apiService.getAxiosInstance().post("/auth/refresh", {
            refreshToken: storedRefreshToken
          });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

          // Update tokens in localStorage
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Restore session with new tokens
          setAccessToken(newAccessToken);
          setUser(parsedUser);
          socketService.connect(newAccessToken);
        } catch (refreshError) {
          // Both tokens are invalid, clear all auth state
          console.warn("Both tokens invalid, clearing auth state:", refreshError);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      }
    };

    // Validate tokens on app load
    validateTokens().finally(() => {
      setIsLoading(false);
    });

    // Listen for force logout events from API service
    const handleForceLogout = () => {
      forceLogout();
    };

    window.addEventListener('forceLogout', handleForceLogout);

    return () => {
      window.removeEventListener('forceLogout', handleForceLogout);
    };
  }, []);

  const login = (
    userData: User,
    accessTokenValue: string,
    refreshTokenValue: string
  ) => {
    setUser(userData);
    setAccessToken(accessTokenValue);
    localStorage.setItem("accessToken", accessTokenValue);
    localStorage.setItem("refreshToken", refreshTokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
    // Connect to socket on login
    socketService.connect(accessTokenValue);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always clear local state regardless of API call success
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      // Disconnect socket on logout
      socketService.disconnect();
    }
  };

  const forceLogout = () => {
    // Force logout without API call - for when tokens are invalid
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // Disconnect socket on logout
    socketService.disconnect();
  };

  const updateUserStats = (stats: UserStats) => {
    console.log("[DEBUG] AuthContext updateUserStats called with:", stats);
    if (user) {
      const updatedUser = { ...user, stats };
      console.log("[DEBUG] Updated user object:", updatedUser);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("[DEBUG] User stats updated in context and localStorage");
    } else {
      console.log("[DEBUG] No user found in context, cannot update stats");
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    forceLogout,
    accessToken,
    updateUserStats,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
