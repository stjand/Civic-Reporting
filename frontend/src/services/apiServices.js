import apiClient from '../config/api';

// ============ REPORT SERVICES ============

// Get current user's reports
export const getMyReports = async () => {
  try {
    const response = await apiClient.get('/reports/my-reports');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get current user's statistics
export const getMyStats = async () => {
  try {
    const response = await apiClient.get('/reports/my-stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Submit a new report
export const submitReport = async (formData) => {
  try {
    const response = await apiClient.postFormData('/reports', formData);
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get report details by ID
export const getReportDetails = async (reportId) => {
  try {
    const response = await apiClient.get(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get reports for validation
export const getValidationReports = async () => {
  try {
    const response = await apiClient.get('/reports/validate/pending');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ ADMIN SERVICES ============

// Get admin dashboard data
export const getAdminDashboard = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ AUTH SERVICES ============

// Login
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Signup
export const signup = async (userData) => {
  try {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Logout
export const logout = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ USER PROFILE SERVICES ============

// Update user profile data
export const updateMyProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/auth/me/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Change user password
export const changeMyPassword = async (passwordData) => {
  try {
    const response = await apiClient.put('/auth/me/password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update a report's status or other details
export const updateReportStatus = async (reportId, updateData) => {
  try {
    const response = await apiClient.put(`/admin/reports/${reportId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};