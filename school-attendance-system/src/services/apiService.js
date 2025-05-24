// src/services/apiService.js
import axios from 'axios';
import storageUtils from '../utils/storageUtils';
import { logger } from '../utils/logger';

// Use the environment variable or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create an instance of axios with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: enables cookies for CSRF protection
  headers: {
    'Content-Type': 'application/json',
  }
});

// Store CSRF token for reuse
let csrfToken = null;

/**
 * Fetch CSRF token from the backend
 * @returns {Promise<string>} The CSRF token
 */
export const fetchCsrfToken = async () => {
  try {
    logger.debug('Fetching CSRF token...');
    // Always fetch a fresh token
    const response = await axiosInstance.get('/csrf-token', { 
      withCredentials: true,
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Add timestamp to prevent caching
      params: { _t: new Date().getTime() }
    });
    
    logger.debug('CSRF token response received');
    if (!response.data?.csrfToken) {
      logger.error('No CSRF token found in response', response.data);
      throw new Error('Invalid CSRF token response');
    }
    
    csrfToken = response.data.csrfToken;
    sessionStorage.setItem('csrfToken', csrfToken);
    return csrfToken;
  } catch (error) {
    logger.error('Error fetching CSRF token:', error);
    
    // Check for specific errors
    if (error.response?.status === 401) {
      // User is not authenticated, clear auth data
      storageUtils.clearAuth();
    }
    
    throw error;
  }
};

/**
 * Add CSRF token to request config 
 */
const addCsrfToken = async (config) => {
  try {
    // Try to get token from memory
    if (!csrfToken) {
      // Try session storage
      csrfToken = sessionStorage.getItem('csrfToken');
    }
    
    // For DELETE, POST, PUT requests, always ensure we have a token
    const requiresToken = ['delete', 'post', 'put'].includes(config.method?.toLowerCase());
      if (requiresToken && !csrfToken) {
      logger.debug('No CSRF token found for sensitive request, fetching one now...');
      try {
        csrfToken = await fetchCsrfToken();
      } catch (tokenError) {
        logger.warn('Failed to fetch CSRF token:', tokenError);
      }
    }
    
    if (csrfToken) {
      config.headers = {
        ...(config.headers || {}),
        'X-CSRF-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest'
      };
    } else if (requiresToken) {
      logger.warn('No CSRF token available for sensitive request:', config.method, config.url);
    }
    
    return config;
  } catch (error) {
    logger.error('Error adding CSRF token:', error);
    return config;
  }
};

// Add request interceptor for CSRF token
axiosInstance.interceptors.request.use(addCsrfToken);

// Add response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging (development only)
    logger.debug(`Request succeeded for ${response.config?.url}:`, {
      status: response.status,
      statusText: response.statusText,
      url: response.config?.url
    });
    return response;
  },
  async (error) => {
    logger.error(`Request failed for ${error.config?.url}:`, error);

    // Handle CSRF token errors
    if (error.response?.status === 403 && 
        (error.response?.data?.error?.includes('csrf') || 
         error.response?.data?.message?.includes('csrf') ||
         error.message?.includes('CSRF'))) {
      logger.debug('CSRF token error detected, fetching new token');
      try {
        // Clear existing token
        csrfToken = null;
        sessionStorage.removeItem('csrfToken');
        
        // Get a fresh token
        await fetchCsrfToken();
        logger.debug('New CSRF token fetched successfully, retrying original request');
        
        // Retry the original request with new token
        const newConfig = { ...error.config };
        delete newConfig.headers['X-CSRF-Token'];
        return axiosInstance(newConfig);
      } catch (retryError) {
        logger.error('Error retrying request with new CSRF token:', retryError);
        throw error;
      }
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      logger.warn('Authentication error detected (401)');
      // Clear auth state
      storageUtils.clearAuth();
      // Let the error propagate to be handled by the component
    }

    throw error;
  }
);

// Create the API service with standard CRUD methods
const apiService = {
  /**
   * Make a GET request
   * @param {string} url - The URL to fetch
   * @param {Object} options - Request options
   * @returns {Promise<any>} The response data
   */
  get: async (url, options = {}) => {
    try {
      const response = await axiosInstance.get(url, options);
      return response.data;
    } catch (error) {
      logger.error(`GET request failed for ${url}:`, error);
      throw error;
    }
  },

  /**
   * Make a POST request
   * @param {string} url - The URL to post to
   * @param {any} data - The data to send
   * @param {Object} options - Request options
   * @returns {Promise<any>} The response data
   */
  post: async (url, data, options = {}) => {
    try {
      const response = await axiosInstance.post(url, data, options);
      return response.data;
    } catch (error) {
      logger.error(`POST request failed for ${url}:`, error);
      throw error;
    }
  },

  /**
   * Make a PUT request
   * @param {string} url - The URL to put to
   * @param {any} data - The data to send
   * @param {Object} options - Request options
   * @returns {Promise<any>} The response data
   */
  put: async (url, data, options = {}) => {
    try {
      const response = await axiosInstance.put(url, data, options);
      return response.data;
    } catch (error) {
      logger.error(`PUT request failed for ${url}:`, error);
      throw error;
    }
  },
  /**
   * Make a DELETE request
   * @param {string} url - The URL to delete from
   * @param {Object} options - Request options
   * @returns {Promise<any>} The response data
   */
  delete: async (url, options = {}) => {
    try {
      // Always ensure we have a fresh CSRF token for DELETE requests
      if (options.refreshCsrf !== false) {        try {
          await fetchCsrfToken();
        } catch (csrfError) {
          logger.warn('Failed to refresh CSRF token before DELETE request:', csrfError);
        }
      }
      
      const response = await axiosInstance.delete(url, options);
      return response.data;
    } catch (error) {
      logger.error(`DELETE request failed for ${url}:`, error);
        // Special handling for CSRF token errors
      if (error.response?.status === 403 && 
          (error.response?.data?.error?.includes('csrf') || 
           error.message?.includes('CSRF'))) {
        
        logger.warn('CSRF token error detected for DELETE request, attempting retry with fresh token');
        
        try {
          // Fetch a new token and retry
          await fetchCsrfToken();
          const retryResponse = await axiosInstance.delete(url, options);
          return retryResponse.data;
        } catch (retryError) {
          logger.error(`DELETE retry failed for ${url}:`, retryError);
          throw retryError;
        }
      }
      
      throw error;
    }
  },

  /**
   * Upload a file
   * @param {string} url - The URL to upload to
   * @param {FormData} formData - The form data with file
   * @param {Object} options - Request options
   * @returns {Promise<any>} The response data
   */
  upload: async (url, formData, options = {}) => {
    try {
      const uploadOptions = {
        ...options,
        headers: {
          ...(options.headers || {}),
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axiosInstance.post(url, formData, uploadOptions);
      return response.data;
    } catch (error) {
      logger.error(`Upload failed for ${url}:`, error);
      throw error;
    }
  },

  // Export CSRF token utilities
  fetchCsrfToken
};

// Export the API service as ES module
export default apiService;