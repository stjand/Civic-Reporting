// Exact path of file: frontend/src/components/PrivateRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component to protect routes based on authentication status and user role.
 */
function PrivateRoute({ children, requiredRole }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Render a loading spinner while checking auth status
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    ); 
  }

  // 1. Check Authentication
  if (!isAuthenticated) {
    // If not authenticated, redirect to login. 
    // Append the admin flag if the route explicitly required it.
    const loginPath = requiredRole === 'admin' ? '/login?admin=true' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Determine the logged-in user's correct dashboard path for redirection
  const userDashboardPath = user?.role === 'admin' ? '/analytics' : '/citizen-dashboard';

  // 2. Check Role Authorization
  // Note: Using toLowerCase() here for robust role checking.
  if (requiredRole && user?.role?.toLowerCase() !== requiredRole) { 
    // If a role is required and the user doesn't have it (e.g., Citizen accessing Admin route)
    // Redirect the user to their own designated dashboard.
    return <Navigate to={userDashboardPath} replace />;
  }

  // 3. Authorization successful
  return children;
}

export default PrivateRoute;