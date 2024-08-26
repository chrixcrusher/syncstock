import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // Replace with your API URL
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss-token');
  if (token) {
    config.headers['Authorization'] = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Handle unauthorized access, e.g., redirect to login
    localStorage.removeItem('ss-token');
    window.location.href = '/sign-in';
  }
  return Promise.reject(error);
});

export default api;
