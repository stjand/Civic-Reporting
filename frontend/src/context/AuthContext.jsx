import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Custom navigation function (defined here for global use in context)
const navigate = (path) => {
    if (path) {
        window.history.pushState({}, '', path)
        window.dispatchEvent(new Event('navigate'))
    }
}

const AuthContext = createContext(null);

// API Base URL - adjust this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'; 

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

  // Function to get role-based home page
  const getRoleHomePage = (userRole) => {
    switch(userRole?.toLowerCase()) {
      case 'citizen':
        return '/citizen';
      case 'admin':
      case 'official':
        return '/admin';
      default:
        return '/';
    }
  };

  // Function to fetch user details (checks the JWT cookie)
  const loadUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // NEW: Automatically redirect to role-based homepage if on login/register pages
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
          const homePage = getRoleHomePage(userData.role);
          if (currentPath !== homePage) {
            navigate(homePage);
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Load user error:', error);
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
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const userData = data.user;
      setUser(userData);
      setIsAuthenticated(true);
      
      // NEW: Role-based redirect after login
      const homePage = getRoleHomePage(userData.role);
      navigate(homePage);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const userData = data.user;
      setUser(userData);
      setIsAuthenticated(true);
      
      // NEW: Role-based redirect after signup
      const homePage = getRoleHomePage(userData.role);
      navigate(homePage);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error, proceeding to clear client state:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to main homepage after logout
      navigate('/');
    }
  };
  
  // Check if user is admin (works for both 'admin' and legacy admin roles)
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  
  // Check if user is an official
  const isOfficial = user?.role?.toLowerCase() === 'official';
  
  // Check if user is a citizen
  const isCitizen = user?.role?.toLowerCase() === 'citizen';

  // NEW: Function to check if user can access a specific path
  const canAccessPath = (path) => {
    if (!isAuthenticated) {
      // Non-authenticated users can only access public pages
      return ['/', '/login', '/register', '/status'].includes(path) || path.startsWith('/status/');
    }

    const role = user?.role?.toLowerCase();
    
    // Citizens can access citizen pages and public pages
    if (role === 'citizen') {
      return [
        '/', '/citizen', '/report', '/my-reports', '/validate-reports', '/profile', '/status'
      ].includes(path) || path.startsWith('/status/');
    }
    
    // Admins/Officials can access admin dashboard and public pages
    if (role === 'admin' || role === 'official') {
      return ['/', '/admin', '/official', '/status'].includes(path) || path.startsWith('/status/');
    }
    
    return false;
  };

  // NEW: Function to get appropriate redirect path for unauthorized access
  const getRedirectPath = () => {
    if (!isAuthenticated) {
      return '/login';
    }
    return getRoleHomePage(user?.role);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    isAdmin,
    isOfficial,
    isCitizen,
    loadUser,
    canAccessPath,
    getRedirectPath,
    getRoleHomePage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};