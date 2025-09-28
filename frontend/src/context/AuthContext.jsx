import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../config/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch user details (checks the JWT cookie)
  const loadUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data.user;
      
      // Log user data to console for debugging role issues
      // console.log('User logged in:', userData); 

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const userData = response.data.user;
      setUser(userData);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      const userData = response.data.user;
      setUser(userData);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed';
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error, proceeding to clear client state:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
    }
  };
  
  // FIX: Added .toLowerCase() to ensure authorization works regardless of DB capitalization
  const isAdmin = user?.role?.toLowerCase() === 'admin'; 

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading, 
        isAdmin,
        login, 
        register,
        logout,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};