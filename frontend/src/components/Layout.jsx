import React from 'react';
// In any component
import { getMyReports, getMyStats, getAdminDashboard } from '../services/apiServices';

/**
 * Main application layout component.
 */
function Layout({ children }) {
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* The header is intentionally removed to meet the user's request. */}
      
      {/* Main Content: Removed max-w-6xl and mx-auto for full width */}
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-10 border-t">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} CivicReporter. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Layout;