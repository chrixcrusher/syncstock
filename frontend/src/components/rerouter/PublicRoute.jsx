// src/components/PublicRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../context/AuthProvider'; // Adjust the import path as necessary

const PublicRoute = ({ restricted }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      // Simulate a delay if needed, e.g., fetching from an API
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated && restricted) {
    return <Navigate to="/dashboard/inventory" />;
  }

  return <Outlet />;
};

export default PublicRoute;
