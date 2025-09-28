// Exact path of file: frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Create the context
const AuthContext = createContext();

// Mock User Data for demonstration (replace with API calls)
const MOCK_USERS = {
  // Citizen
  'citizen@example.com': { 
    id: 'c1', 
    name: 'Citizen Jane', 
    email: 'citizen@example.com', 
    role: 'citizen', 
    token: 'citizen-jwt-token' 
  },
  // Admin (Government Official)
  'admin@example.com': { 
    id: 'a1', 
    name: 'Gov John', 
    email: 'admin@example.com', 
    role: 'admin', 
    department: 'Public Works', 
    token: 'admin-jwt-token' 
  },
};

/**
 * Custom hook to use the authentication context
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * AuthProvider Component
 * Manages authentication state (user, isAuthenticated, isLoading)
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Handles user login with role validation.
   * @param {string} email 
   * @param {string} password - Password is ignored in this mock, but kept for signature.
   * @param {string} requestedRole - 'citizen' or 'admin'.
   */
  const login = async (email, password, requestedRole) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = MOCK_USERS[email];

    if (!foundUser || foundUser.role !== requestedRole) {
      // Throw error if user not found or role mismatch
      throw new Error(`Invalid credentials or role mismatch for ${requestedRole}.`);
    }

    // Login successful
    setUser(foundUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(foundUser));
  };

  /**
   * Handles user registration.
   * NOTE: In a real application, this would call a backend API.
   */
  const register = async (userData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Basic check for mock data collision (replace with API error handling)
    if (MOCK_USERS[userData.email]) {
        throw new Error("User already exists with this email address.");
    }

    // Simulate successful registration
    const newUser = {
        ...userData,
        id: `temp-${Date.now()}`,
        token: `${userData.role}-temp-token`,
        // Ensure role is correctly saved
        role: userData.role
    };

    // Auto-login the user after registration (typical flow)
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  /**
   * Handles user logout
   */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  // Memoize the value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  }), [user, isAuthenticated, isLoading]);

  if (isLoading) {
    // You could render a global loading spinner here if needed
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};