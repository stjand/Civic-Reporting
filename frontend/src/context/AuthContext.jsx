import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Custom navigation functions
const navigate = (path) => {
  if (path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('navigate'));
  }
};

const navigateAndReplace = (path) => {
  if (path) {
    window.history.replaceState({}, '', path);
    window.dispatchEvent(new Event('navigate'));
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getRoleHomePage = useCallback((userRole) => {
    switch(userRole?.toLowerCase()) {
      case 'citizen': return '/citizen';
      case 'admin':
      case 'official': return '/admin';
      default: return '/';
    }
  }, []);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    
    setUser(data.user);
    setIsAuthenticated(true);
    navigateAndReplace(getRoleHomePage(data.user.role));
    return data;
  };
  
  const signup = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    
    setUser(data.user);
    setIsAuthenticated(true);
    navigateAndReplace(getRoleHomePage(data.user.role));
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // 🟢 FIX: Navigate directly to the login page after logout
      navigate('/login');
    }
  };

  const getRedirectPath = useCallback(() => {
    if (!isAuthenticated) return '/login';
    return getRoleHomePage(user?.role);
  }, [isAuthenticated, user, getRoleHomePage]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    loadUser,
    getRedirectPath,
    navigate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};