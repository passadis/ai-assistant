// AuthContext.js

import React, { createContext, useState, useEffect } from 'react';

// Create the AuthContext
export const AuthContext = createContext();

// Create a Provider component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token') || null,
    userId: localStorage.getItem('UserId') || null,
  });

  // Function to handle login
  const login = (token, userId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('UserId', userId);
    setAuth({ token, userId });
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('UserId');
    setAuth({ token: null, userId: null });
  };

  // Optional: Sync state with localStorage changes (e.g., when multiple tabs are open)
  useEffect(() => {
    const handleStorageChange = () => {
      setAuth({
        token: localStorage.getItem('token'),
        userId: localStorage.getItem('UserId'),
      });
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};