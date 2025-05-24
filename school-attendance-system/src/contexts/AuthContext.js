import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import storageUtils from '../utils/storageUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: storageUtils.isAuthenticated(),
    user: storageUtils.getUser() || {},
    token: storageUtils.getToken(),
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
      try {
        console.log('Verifying authentication state on app startup...');
        // Try to fetch validation status - this will use HTTP-only cookies if present
        const response = await apiService.get('/auth/validate');
        
        console.log('Auth validation response:', response);
        
        if (response?.valid) {          // Get stored user data or create from response
          let userData = storageUtils.getUser() || {};
          
          // If we have user data from the response, update local storage
          if (response.userId && response.role) {
            userData = {
              id: response.userId,
              role: response.role,
              ...userData // Keep any other existing user data
            };
            storageUtils.setUser(userData);
          }
          
          setAuth(prev => ({
            ...(prev || {}),
            isAuthenticated: true,
            user: userData,
            loading: false,
            error: null
          }));
          
          console.log('User is authenticated:', userData);        } else {
          // Invalid token - clear everything
          console.log('Authentication validation failed, clearing auth state');
          storageUtils.clearAuth();
          setAuth({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null
          });
        }      } catch (error) {
        console.error('Auth verification failed:', error);
        storageUtils.clearAuth();
        setAuth({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null // Don't show error message on initial load
        });
      }
    };

    verifyAuth();
  }, []);  const login = async (email, password) => {
    setAuth(prev => ({ ...(prev || {}), loading: true, error: null }));
    
    try {
      console.log('Login process starting...');
      // Ensure fresh CSRF token
      console.log('Fetching fresh CSRF token...');
      await apiService.fetchCsrfToken();
      console.log('CSRF token fetch completed');
      
      console.log('Sending login request...');
      const response = await apiService.post('/auth/login', {
        email: email.trim(),
        password: password.trim()
      }, {
        refreshCsrf: true
      });

      console.log('Login response received:', response);
        // Accept both formats - the traditional token in response AND the new cookie-based auth
      // The backend should now send token in response for backward compatibility
      if (response && ((response.token && response.user) || (response.userId && response.role))) {
        let user;
        
        // Handle the various response formats
        if (response.user) {
          // If we have a complete user object
          user = response.user;
        } else {
          // Create a user object from individual fields
          user = {
            id: response.userId,
            role: response.role,
            name: response.name || ''
          };
        }
        
        // Ensure role is explicitly set from either response.role or response.user.role
        if (!user.role && response.role) {
          user.role = response.role;
        }
          
        // Ensure role is explicitly set from either response.role or response.user.role
        if (!user.role && response.role) {
          user.role = response.role;
        }
          // For backward compatibility, store token if available
        if (response.token) {
          console.log('Token received in response body, storing in localStorage');
          localStorage.setItem('token', response.token);
        } else {
          console.log('No token in response body - using HTTP-only cookie auth');
        }
        
        // Store user info using the storageUtils helper to ensure consistent storage
        storageUtils.setUser(user);
        console.log('User data stored consistently using storageUtils.setUser()');
        
        // Update auth state
        setAuth({
          isAuthenticated: true,
          user: user,
          token: response.token, // May be undefined if using cookie auth
          loading: false,
          error: null
        });

        console.log('Login successful - user authenticated:', user);
        return true;
      } else {
        console.error('Invalid login response format:', response);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error details:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      `Server error: ${error.response.status} ${error.response.statusText}`;
        console.error('Server response error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
        console.error('No response received:', error.request);
      } else {
        // Error in request setup
        errorMessage = `Request error: ${error.message}`;
        console.error('Request setup error:', error.message);
      }
      
      setAuth(prev => ({
        ...(prev || {}),
        isAuthenticated: false,
        loading: false,
        error: errorMessage
      }));
      
      return false;
    }
  };  const logout = async () => {
    try {
      console.log('[LOGOUT] Starting logout process...');
      await apiService.post('/auth/logout');
      console.log('[LOGOUT] Server logout request successful');
    } catch (error) {
      console.error('[LOGOUT] Error during server logout request:', error);
    } finally {
      // Use the storageUtils helper to consistently clear all auth data
      console.log('[LOGOUT] Clearing local authentication data...');
      storageUtils.clearAuth();
      console.log('[LOGOUT] Auth data cleared using storageUtils.clearAuth()');
      
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      });
      console.log('[LOGOUT] Authentication state reset, logout complete');
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
