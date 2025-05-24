// src/services/apiServiceWrapper.js
// This is a wrapper for the apiService that ensures both import styles work correctly

import axios from 'axios';
import DOMPurify from 'dompurify';
import cacheManager from '../utils/cacheManager';
import storageUtils from '../utils/storageUtils'; // Use the main standardized version
import apiService from './apiService';
import { logger } from '../utils/logger'; // Import secure logger

// Use the environment variable or default to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * Login the user and set authentication cookies
 * @param {Object} credentials - Login credentials
 * @returns {Promise<any>} API response data
 */
const login = async (credentials) => {
  try {
    // Sanitize credentials to prevent XSS
    const sanitizedCredentials = sanitizeData(credentials);
    
    console.log('Fetching CSRF token before login...');
    // Ensure CSRF token is fetched first
    const token = await apiService.fetchCsrfToken();
    console.log('CSRF token obtained:', token ? 'Yes (truncated: ' + token.substring(0, 8) + '...)' : 'No');

    console.log('Sending login request...');
    // Make login request
    const response = await apiService.post('/auth/login', sanitizedCredentials);
    console.log('Login response received:', response);
      // Store user info in local storage
    if (response.user) {
      storageUtils.setUser(response.user);
    } else if (response.userId && response.role) {
      // Create user object from response fields
      const user = {
        id: response.userId,
        role: response.role,
        name: response.name || ''
      };
      storageUtils.setUser(user);
    }
    
    // Store token if available in response body
    if (response.token) {
      storageUtils.setToken(response.token);
    }
    
    return response;
  } catch (error) {
    console.error('Login error details:', error);
    logger.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout the current user
 * @returns {Promise<any>} API response data
 */
const logout = async () => {
  try {
    // First fetch the CSRF token
    await apiService.fetchCsrfToken();
      
    // Call logout endpoint
    const response = await apiService.post('/auth/logout', {});
    
    // Clear any cached data
    cacheManager.clear();
    
    // Clear user info
    storageUtils.clearAuth();
    
    return response;
  } catch (error) {
    logger.error('Logout error:', error);
    throw error;
  }
};

/**
 * Sanitize data to prevent XSS attacks
 * @param {any} data - The data to sanitize
 * @returns {any} - The sanitized data
 */
const sanitizeData = (data) => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return DOMPurify.sanitize(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  }
  
  return data;
};

// Create a wrapper that forwards all apiService methods
const apiServiceWrapper = {
  // Forward all original apiService methods using arrow functions
  // This avoids binding issues during module initialization
  get: (...args) => apiService.get(...args),
  post: (...args) => apiService.post(...args),
  put: (...args) => apiService.put(...args),
  delete: (...args) => apiService.delete(...args),
  upload: (...args) => apiService.upload(...args),
  fetchCsrfToken: (...args) => apiService.fetchCsrfToken(...args),
  
  // Custom wrapper methods
  login,
  logout,
  sanitizeData
};

// Export named functions for direct imports
export { login, logout, sanitizeData };

// Export full wrapper as default
export default apiServiceWrapper;
