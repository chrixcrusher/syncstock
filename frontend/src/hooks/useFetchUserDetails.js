import { useState, useEffect } from 'react';
import useAuthAxios from './useAuthAxios';;

const useFetchUserDetails = () => {
  const [userDetails, setUserDetails] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
  });
  const [error, setError] = useState(null);

  const api = useAuthAxios();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get('user-details/');
        setUserDetails(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error);
      }
    };

    fetchUserDetails();
  }, [api]);

  return { userDetails, setUserDetails, error };
};

export default useFetchUserDetails;
