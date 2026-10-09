import React from 'react';
import { Navigate } from 'react-router-dom';

export const StudentSignupPage = () => {
  return <Navigate to="/login?mode=signup" replace />;
};
