
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

function normalizeUser(user) {
  if (!user) return user;
  if (user.id) return user;
  if (user._id) return { ...user, id: user._id };
  return user;
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authAPI.login(credentials);
      const userData = normalizeUser(response.data);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      const newUser = normalizeUser(response.data);
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (process.env.NODE_ENV !== 'development') {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const checkAuthStatus = async () => {
    setInitialLoading(true);
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        
        // In development, just use saved user
        if (process.env.NODE_ENV === 'development') {
          setUser(userData);
          return;
        }

        // In production, verify with server
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch (error) {
          // If token is invalid, remove saved user
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    initialLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};