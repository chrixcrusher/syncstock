import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider'; // Import the Auth context
import api from '../api/api'; // Import your configured Axios instance

const useLogout = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth(); // Access the logout method and authentication state

  const handleLogout = async () => {
    if (!isAuthenticated) {
      // If not authenticated, prevent logout
      console.warn('User is not authenticated');
      return;
    }

    try {
      const token = localStorage.getItem('ss-token'); // Retrieve token from local storage
      await api.post('/logout/', { token }); // Send token in request body
      logout(); // Call logout to update context state
      navigate('/sign-in'); // Redirect to login
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return handleLogout;
};

export default useLogout;
