// File: App.jsx

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ReportForm = lazy(() => import('./pages/ReportForm'));
const ReportStatus = lazy(() => import('./pages/ReportStatus'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CitizenHomepage = lazy(() => import('./pages/CitizenHomepage'));
const MyReports = lazy(() => import('./pages/MyReports'));
const ValidateReports = lazy(() => import('./pages/ValidateReports'));
const Profile = lazy(() => import('./pages/Profile'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
  </div>
);

// Custom Navigation Hook
const useNavigation = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  useEffect(() => {
    const onNavigate = () => setCurrentPath(window.location.pathname);
    window.addEventListener('navigate', onNavigate);
    window.addEventListener('popstate', onNavigate);
    return () => {
      window.removeEventListener('navigate', onNavigate);
      window.removeEventListener('popstate', onNavigate);
    };
  }, []);
  // We get the navigate function from AuthContext now
  return { currentPath };
};

// Main Router Component
function AppRouter() {
  const { isLoading, isAuthenticated, user, getRedirectPath, navigate } = useAuth();
  const { currentPath } = useNavigation();

  useEffect(() => {
    // 🟢 FIX: If the user is not logged in and lands on the homepage, redirect to LOGIN, not register
    if (!isLoading && !isAuthenticated && currentPath === '/') {
      window.history.replaceState({}, '', '/login');
      window.dispatchEvent(new Event('navigate'));
    }
  }, [isLoading, isAuthenticated, currentPath, navigate]);
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  // Public routes accessible to everyone
  if (!isAuthenticated) {
    switch (currentPath) {
      case '/login': return <Login />;
      case '/register': return <Register />;
      case '/': 
        // This case is now a fallback while the useEffect redirect happens.
        // Explicitly return Login to prevent brief LoadingFallback flash
        return <Login />; 
      default:
        // If trying to access any other page, redirect to login
        navigate('/login');
        return <LoadingFallback />;
    }
  }

  // Authenticated Routes (Private)
  const role = user?.role?.toLowerCase();

  switch (role) {
    case 'citizen':
      const citizenRoutes = {
        '/citizen': <CitizenHomepage />,
        '/report': <ReportForm />,
        '/my-reports': <MyReports />,
        '/validate-reports': <ValidateReports />,
        '/profile': <Profile />,
      };
      // Allow citizens to see the report status page too
      if (currentPath.startsWith('/status')) {
        return <ReportStatus />;
      }
      if (citizenRoutes[currentPath]) {
        return citizenRoutes[currentPath];
      }
      break;
    
    case 'admin':
    case 'official':
      const adminRoutes = {
        '/admin': <AdminDashboard />,
      };
      if (adminRoutes[currentPath]) {
        return adminRoutes[currentPath];
      }
      break;
      
    default:
      navigate('/login');
      return <LoadingFallback />;
  }

  // If no route has matched for an authenticated user, redirect them to their dashboard
  navigate(getRedirectPath());
  return <LoadingFallback />;
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <AppRouter />
      </Suspense>
    </AuthProvider>
  );
}

export default App;