import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkcanvas-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 text-sm font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    if (allowedRole === 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, check role
  if (allowedRole && role !== allowedRole) {
    // If student tries to visit admin routes
    if (allowedRole === 'admin' && role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    // If admin tries to visit student routes
    if (allowedRole === 'student' && role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Fallback if role is not recognized
    return <Navigate to="/login" replace />;
  }

  return children;
};
