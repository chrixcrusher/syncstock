import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider'; // Adjust the import path as necessary

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to sign-in page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
