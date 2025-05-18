// src/services/apiServiceWrapper.js
// This is a wrapper for the apiService that ensures both import styles work correctly

import axios from 'axios';
import DOMPurify from 'dompurify';
import cacheManager from '../utils/cacheManager';
import { storageUtils } from '../utils/storageUtils';
import apiService from './apiService';

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
    
    // First fetch the CSRF token
    await apiService.get('/csrf-token', { useCache: false });
    
    // Make login request using apiService which includes the CSRF token
    const response = await apiService.post('/auth/login', sanitizedCredentials);
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
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
    await apiService.get('/csrf-token', { useCache: false });
    
    // Use apiService to include CSRF token
    const response = await apiService.post('/auth/logout', {});
    
    // Clear any cached data
    cacheManager.clearAll();
    
    // Clear user info
    storageUtils.clearUserInfo();
    
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
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

// Create an apiService wrapper that forwards all apiService methods
// while also providing our custom wrapper methods
const apiServiceWrapper = {
  // Forward all the original apiService methods
  get: apiService.get.bind(apiService),
  post: apiService.post.bind(apiService),
  put: apiService.put.bind(apiService),
  delete: apiService.delete.bind(apiService),
  upload: apiService.upload.bind(apiService),
  fetchCsrfToken: apiService.fetchCsrfToken,
  // Our custom wrapper methods
  login,
  logout,
  sanitizeData
};

// Export for ES modules
export default apiServiceWrapper;
