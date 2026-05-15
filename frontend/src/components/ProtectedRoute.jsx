/*
  ProtectedRoute
  - Simple wrapper that redirects unauthenticated users to `/login`
  - While the AuthContext is initializing, it shows a loading placeholder
*/
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // While auth context validates token, avoid rendering private content
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
