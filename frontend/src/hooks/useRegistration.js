// src/hooks/useRegistration.js
import { useState } from 'react';
import axios from 'axios';

const useRegistration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/company/register/', {
        name,
        company_email: email,
        company_address: address,
      });

      setCompanyCode(response.data.company_code);
      setMessage('Company registered successfully!');
      setError('');
      setIsSubmitted(true);
    } catch (err) {
      setError('Error registering company. Please check the console for details.');
      console.error(err);
    }
  };

  return {
    name,
    email,
    address,
    message,
    error,
    companyCode,
    isSubmitted,
    setName,
    setEmail,
    setAddress,
    handleSubmit
  };
};

export default useRegistration;
