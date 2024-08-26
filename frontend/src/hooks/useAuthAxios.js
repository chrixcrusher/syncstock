// src/hooks/useAuthAxios.js

import { useAuth } from '../context/AuthProvider';
import api from '../api/api'; // Import the centralized Axios instance

const useAuthAxios = () => {
  const { isAuthenticated } = useAuth();
  
  // Modify the headers if needed based on authentication status
  const apiInstance = api; // Use the centralized instance
  
  if (isAuthenticated) {
    const token = localStorage.getItem('ss-token');
    apiInstance.defaults.headers['Authorization'] = `Token ${token}`;
  } else {
    delete apiInstance.defaults.headers['Authorization'];
  }

  return apiInstance;
};

export default useAuthAxios;
