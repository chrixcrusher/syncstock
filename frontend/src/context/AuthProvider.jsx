import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check token validity on mount
  useEffect(() => {
    const token = localStorage.getItem('ss-token');
    // Add logic to validate the token if necessary
    setIsAuthenticated(!!token);
  }, []);

  const login = (token) => {
    localStorage.setItem('ss-token', token);
    // Add token validation if required
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('ss-token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
