import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: !!localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    token: localStorage.getItem('token'),
    loading: true,
    error: null
  });

  // Add loading timeout safety
  useEffect(() => {
    let timeoutId;
    if (auth.loading) {      timeoutId = setTimeout(() => {
        setAuth(prev => ({
          ...(prev || {}),
          loading: false,
          error: 'Authentication check timed out. Please try again.'
        }));
      }, 15000); // 15 second timeout
    }
    return () => timeoutId && clearTimeout(timeoutId);
  }, [auth.loading]);

  // Verify token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuth(prev => ({ ...(prev || {}), loading: false }));
        return;
      }

      try {
        const response = await apiService.get('/auth/verify');
        if (response?.valid) {          setAuth(prev => ({
            ...(prev || {}),
            isAuthenticated: true,
            loading: false,
            error: null
          }));
        } else {
          // Invalid token - clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuth({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuth({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: 'Authentication failed. Please login again.'
        });
      }
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    setAuth(prev => ({ ...(prev || {}), loading: true, error: null }));
    
    try {
      // Ensure fresh CSRF token
      await apiService.fetchCsrfToken();
      
      const response = await apiService.post('/auth/login', {
        email: email.trim(),
        password: password.trim()
      }, {
        refreshCsrf: true
      });

      if (response?.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        setAuth({
          isAuthenticated: true,
          user: response.user,
          token: response.token,
          loading: false,
          error: null
        });

        return true;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';      setAuth(prev => ({
        ...(prev || {}),
        loading: false,
        error: errorMessage
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      });
    }
  };
  return (
    <AuthContext.Provider value={{
      ...(auth || {}),
      login,
      logout,
      setAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};
