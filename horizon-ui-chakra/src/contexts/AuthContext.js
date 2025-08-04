import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from 'services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      const userInfo = {
        username: localStorage.getItem('username'),
        userRole: localStorage.getItem('userRole'),
        userFullName: localStorage.getItem('userFullName'),
      };
      
      if (authStatus && userInfo.username) {
        setIsAuthenticated(true);
        setUser(userInfo);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password);
      
      // Set authentication data
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", response.user.username);
      localStorage.setItem("userRole", response.user.role);
      localStorage.setItem("userFullName", response.user.full_name);
      
      const userInfo = {
        username: response.user.username,
        userRole: response.user.role,
        userFullName: response.user.full_name,
      };
      
      setIsAuthenticated(true);
      setUser(userInfo);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear all authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;