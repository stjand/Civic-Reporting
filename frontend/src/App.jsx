import React, { Suspense, lazy, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const ReportForm = lazy(() => import('./pages/ReportForm'));
const ReportStatus = lazy(() => import('./pages/ReportStatus'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// NEW: Lazy load citizen components
const CitizenHomepage = lazy(() => import('./pages/CitizenHomepage'));
const MyReports = lazy(() => import('./pages/MyReports'));
const ValidateReports = lazy(() => import('./pages/ValidateReports'));
const Profile = lazy(() => import('./pages/Profile'));

// Simple loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Simple Router Component
function AppRouter() {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    canAccessPath, 
    getRedirectPath 
  } = useAuth();
  
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for both popstate and a custom event
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('navigate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigate', handleLocationChange);
    };
  }, []);

  // Navigation helper
  const navigate = (path) => {
    if (path === currentPath) return; // Prevent unnecessary re-renders
    
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    
    // Dispatch custom event to trigger re-render
    window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
  };

  // Provide navigation context
  React.useEffect(() => {
    window.navigate = navigate;
  }, [currentPath]); // Re-create function when path changes

  if (isLoading) {
    return <LoadingFallback />;
  }

  // Access Control Component
  const AccessControl = ({ children, requiredRoles = [] }) => {
    // Check if user can access the current path
    if (!canAccessPath(currentPath)) {
      const redirectPath = getRedirectPath();
      
      // Auto-redirect to appropriate page
      React.useEffect(() => {
        navigate(redirectPath);
      }, [redirectPath]);

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            {!isAuthenticated 
              ? 'Please log in to access this page.' 
              : `You don't have permission to access this page as a ${user?.role}.`
            }
          </p>
          <button 
            onClick={() => navigate(redirectPath)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {!isAuthenticated ? 'Go to Login' : 'Go to Dashboard'}
          </button>
        </div>
      );
    }

    // Additional role-specific checks if needed
    if (requiredRoles.length > 0 && isAuthenticated) {
      const userRole = user?.role?.toLowerCase();
      if (!requiredRoles.includes(userRole)) {
        const redirectPath = getRedirectPath();
        
        React.useEffect(() => {
          navigate(redirectPath);
        }, [redirectPath]);

        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              This page is restricted to {requiredRoles.join(', ')} roles only.
            </p>
            <button 
              onClick={() => navigate(redirectPath)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        );
      }
    }

    return children;
  };

  // Route rendering logic
  const renderRoute = () => {
    switch (currentPath) {
      case '/':
        // NEW: Redirect authenticated users to their role-based homepage
        if (isAuthenticated) {
          const userRole = user?.role?.toLowerCase();
          if (userRole === 'citizen') {
            return <CitizenHomepage />;
          } else if (userRole === 'admin' || userRole === 'official') {
            return <AdminDashboard />;
          }
        }
        return <Home />;
      
      case '/login':
        return (
          <AccessControl>
            <Login />
          </AccessControl>
        );
      
      case '/register':
        return (
          <AccessControl>
            <Register />
          </AccessControl>
        );
      
      // NEW: Citizen routes
      case '/citizen':
        return (
          <AccessControl requiredRoles={['citizen']}>
            <CitizenHomepage />
          </AccessControl>
        );

      case '/my-reports':
        return (
          <AccessControl requiredRoles={['citizen']}>
            <MyReports />
          </AccessControl>
        );

      case '/validate-reports':
        return (
          <AccessControl requiredRoles={['citizen']}>
            <ValidateReports />
          </AccessControl>
        );

      case '/profile':
        return (
          <AccessControl requiredRoles={['citizen']}>
            <Profile />
          </AccessControl>
        );
      
      // Report form - accessible to all authenticated users
      case '/report':
        return (
          <AccessControl requiredRoles={['citizen', 'official', 'admin']}>
            <ReportForm />
          </AccessControl>
        );
      
      // Status pages - public
      case '/status':
        return <ReportStatus />;
      
      // Admin/Official routes
      case '/admin':
        return (
          <AccessControl requiredRoles={['admin']}>
            <AdminDashboard />
          </AccessControl>
        );
      
      case '/official':
        return (
          <AccessControl requiredRoles={['official', 'admin']}>
            <AdminDashboard />
          </AccessControl>
        );
      
      default:
        // Handle dynamic routes like /status/RPT-001
        if (currentPath.startsWith('/status/')) {
          return <ReportStatus />;
        }
        
        // 404 page
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-gray-600 mb-6">Page not found.</p>
            <button 
              onClick={() => navigate(isAuthenticated ? getRedirectPath() : '/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingFallback />}>
        {renderRoute()}
      </Suspense>
    </div>
  );
}

/**
 * Main Application Component
 * Complete role-based authentication flow with strict access control
 */
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;