import axios from 'axios';

// Get API URL from environment variables, fallback to local
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // CRUCIAL: Must be set to allow sending the HTTP-only cookie to the backend
  withCredentials: true, 
});

// Helper function for POST requests with file uploads (FormData)
apiClient.postFormData = async (url, data) => {
  try {
    const response = await apiClient.post(url, data, {
      // The browser automatically sets the correct Content-Type: multipart/form-data
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Ensure credentials are sent with file uploads too
      withCredentials: true, 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default apiClient;