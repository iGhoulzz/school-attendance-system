// MAIN STORAGE UTILITY - This is the central storage utility that should be used throughout the application
// All other versions (enhanced, fixed, updated) have been consolidated into this file
// Last updated: May 22, 2025
import { logger } from './logger';

const isStorageAvailable = () => {
  try {
    // Check if we're in a browser context
    if (typeof window === 'undefined' || !window.localStorage) return false;
    
    // Test within try/catch to ensure permission issues are caught
    const testKey = '__storage_test__';
    
    // Check for a possible iframe context where localStorage might be restricted
    if (window.self !== window.top) {
      // In an iframe, we need to be careful with localStorage
      logger.info('Application is running in an iframe, storage might be restricted');
      try {
        // Attempt to perform a minimal test
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
      } catch (iframeError) {
        logger.warn('Storage access denied in iframe context:', iframeError);
        return false;
      }
    }
    
    // Normal browser context test
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);    return true;
  } catch (e) {
    logger.warn('localStorage not available:', e);
    return false;
  }
};

// Cache for storage availability to avoid repeated checks
let storageAvailableCache = null;

// Memory fallback storage when localStorage is not available
const memoryStorage = new Map();

// Function to check storage availability with caching
const checkStorageAvailable = () => {
  // In SSR (server-side rendering) contexts, always return false
  if (typeof window === 'undefined') return false;
  
  if (storageAvailableCache === null) {
    storageAvailableCache = isStorageAvailable();
  }
  return storageAvailableCache;
};

/**
 * Create a namespaced key
 * @param {string} key - The original key
 * @param {string} namespace - The namespace
 * @returns {string} - The namespaced key
 */
const createNamespacedKey = (key, namespace = 'school-attendance') => 
  `${namespace}:${key}`;

/**
 * Get json value from storage or return default
 */
const getJsonValue = (value, defaultValue) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return defaultValue;
  }
};

const storageUtils = {
  // Basic storage operations
  getItem: (key) => {
    try {
      if (!checkStorageAvailable()) {
        // Use memory fallback if localStorage isn't available
        return memoryStorage.has(key) ? memoryStorage.get(key) : null;
      }
      const item = localStorage.getItem(key);
      return item ? item : null;
    } catch (e) {
      logger.warn(`Error accessing storage for key ${key}:`, e);
      // Try memory fallback
      return memoryStorage.has(key) ? memoryStorage.get(key) : null;
    }
  },
  
  setItem: (key, value) => {
    try {      if (!checkStorageAvailable()) {
        // Use memory fallback if localStorage isn't available
        memoryStorage.set(key, value);
        return true;
      }
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      logger.warn(`Error setting storage for key ${key}:`, e);
      // Try memory fallback
      memoryStorage.set(key, value);
      return true;
    }
  },
  
  removeItem: (key) => {
    try {      if (!checkStorageAvailable()) {
        // Use memory fallback if localStorage isn't available
        memoryStorage.delete(key);
        return true;
      }
      localStorage.removeItem(key);
      // Also remove from memory fallback if exists
      if (memoryStorage.has(key)) {
        memoryStorage.delete(key);
      }
      return true;
    } catch (e) {
      logger.warn(`Error removing key ${key} from storage:`, e);
      // Try memory fallback
      memoryStorage.delete(key);
      return true;
    }
  },
  
  clear: () => {
    try {      if (!checkStorageAvailable()) {
        // Use memory fallback if localStorage isn't available
        memoryStorage.clear();
        return true;
      }
      localStorage.clear();
      // Also clear memory fallback
      memoryStorage.clear();
      return true;
    } catch (e) {
      logger.warn('Error clearing storage:', e);
      // Try memory fallback
      memoryStorage.clear();
      return true;
    }
  },
  
  // Advanced storage with expiry and JSON support
  
  /**
   * Store a JSON value in localStorage with optional expiry time
   * @param {string} key - The key to store under
   * @param {any} value - The value to store (will be JSON stringified)
   * @param {Object} options - Options object
   * @param {number} options.expiryMinutes - Expiry time in minutes
   * @param {string} options.namespace - Namespace for the key
   */
  setJson: (key, value, { expiryMinutes, namespace } = {}) => {
    try {
      if (!checkStorageAvailable()) return false;
      
      const namespacedKey = createNamespacedKey(key, namespace);
      let storageItem = { value };
      
      // Add expiry if specified
      if (expiryMinutes) {
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);
        storageItem.expiresAt = expiryTime.toISOString();
      }
        localStorage.setItem(namespacedKey, JSON.stringify(storageItem));
      return true;
    } catch (error) {
      logger.error('Error storing JSON item in localStorage:', error);
      return false;
    }
  },
  
  /**
   * Get a JSON value from localStorage
   * @param {string} key - The key to retrieve
   * @param {Object} options - Options object
   * @param {any} options.defaultValue - Default value if key not found
   * @param {string} options.namespace - Namespace for the key
   * @returns {any} - The stored value or defaultValue
   */
  getJson: (key, { defaultValue, namespace } = {}) => {
    try {
      if (!checkStorageAvailable()) return defaultValue;
      
      const namespacedKey = createNamespacedKey(key, namespace);
      const storedItem = localStorage.getItem(namespacedKey);
      
      if (!storedItem) {
        return defaultValue;
      }
      
      const parsed = getJsonValue(storedItem, { value: defaultValue });
      const { value, expiresAt } = parsed;
      
      // Check if expired
      if (expiresAt && new Date() > new Date(expiresAt)) {
        localStorage.removeItem(namespacedKey);
        return defaultValue;
      }
        return value;
    } catch (error) {
      logger.error('Error getting JSON item from localStorage:', error);
      return defaultValue;
    }
  },
  
  /**
   * Clear all items from localStorage with a specific namespace
   * @param {string} namespace - The namespace to clear
   */
  clearNamespace: (namespace = 'school-attendance') => {
    try {
      if (!checkStorageAvailable()) return false;
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`${namespace}:`)) {
          localStorage.removeItem(key);
        }
      });      return true;
    } catch (error) {
      logger.error('Error clearing namespace from localStorage:', error);
      return false;
    }
  },
  
  // Cache-related helpers
  
  /**
   * Cache API response with expiry
   * @param {string} endpoint - API endpoint or key
   * @param {any} data - Data to cache
   * @param {number} expiryMinutes - Cache expiry time in minutes
   */
  cacheApiResponse: (endpoint, data, expiryMinutes = 5) => {
    return storageUtils.setJson(
      `api:${endpoint}`, 
      data, 
      { expiryMinutes, namespace: 'api-cache' }
    );
  },
  
  /**
   * Get cached API response
   * @param {string} endpoint - API endpoint or key
   * @returns {any|null} - Cached data or null if not found/expired
   */
  getCachedApiResponse: (endpoint) => {
    return storageUtils.getJson(
      `api:${endpoint}`, 
      { defaultValue: null, namespace: 'api-cache' }
    );
  },
  
  /**
   * Clear API cache for specific endpoint or all endpoints
   * @param {string} endpoint - Optional endpoint to clear
   */
  clearApiCache: (endpoint) => {
    if (!checkStorageAvailable()) return false;
    
    if (endpoint) {
      return storageUtils.removeItem(
        createNamespacedKey(`api:${endpoint}`, 'api-cache')
      );
    } else {
      return storageUtils.clearNamespace('api-cache');
    }
  },
    // Auth related helpers
  getToken: () => {
    try {
      if (!checkStorageAvailable()) return null;
      return localStorage.getItem('token');
    } catch (e) {
      logger.warn('Error getting auth token:', e);
      return null;
    }
  },
    getAuthToken: () => {
    try {
      if (!checkStorageAvailable()) return null;
      return localStorage.getItem('token');
    } catch (e) {
      logger.warn('Error getting auth token:', e);
      return null;
    }
  },
    setToken: (token) => {
    try {
      if (!checkStorageAvailable()) return false;
      if (!token) {
        logger.warn('No token provided');
        return false;
      }
      
      localStorage.setItem('token', token);
      logger.info('Token saved successfully');
      return true;
    } catch (e) {
      logger.error('Error saving auth token:', e);
      return false;
    }
  },
    isAuthenticated: () => {
    try {
      if (!checkStorageAvailable()) return false;
      
      // Check if token exists AND user data exists
      const hasToken = !!localStorage.getItem('token');
      const hasUser = !!localStorage.getItem('user');
      
      logger.debug('Authentication check - Token exists:', hasToken, 'User exists:', hasUser);
      return hasToken || hasUser; // Return true if either exists for backward compatibility
    } catch (e) {
      logger.error('Error checking authentication status:', e);
      return false;
    }
  },
  clearAuth: () => {
    try {
      if (!checkStorageAvailable()) return false;
      logger.info('Clearing authentication data...');
      console.log('[AUTH] Starting to clear authentication data...');
      
      // Log current values for debugging (only in non-production)
      const currentToken = localStorage.getItem('token');
      const currentRole = localStorage.getItem('role');
      const currentName = localStorage.getItem('name');
      const currentUser = localStorage.getItem('user');
      
      console.log('[AUTH] Pre-logout state:', { 
        hasToken: !!currentToken, 
        role: currentRole, 
        name: currentName,
        hasUserObject: !!currentUser 
      });
      
      // Clear token and other auth-related items
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      
      console.log('[AUTH] Authentication data cleared successfully');
      logger.info('Authentication data cleared successfully');
      return true;
    } catch (e) {
      console.error('[AUTH] Error clearing auth data:', e);
      logger.warn('Error clearing auth data:', e);
      return false;
    }
  },
    clearAuthData: () => {
    try {
      if (!checkStorageAvailable()) return false;
      
      // Clear all auth-related items
      const authItems = ['token', 'role', 'name', 'userId', 'user'];
      authItems.forEach(item => {
        try {
          localStorage.removeItem(item);
        } catch (err) {
          logger.warn(`Could not remove ${item} from storage`, err);
        }
      });
      
      return true;
    } catch (e) {
      logger.warn('Error clearing auth data:', e);
      return false;
    }
  },
  getRole: () => {
    try {
      if (!checkStorageAvailable()) return null;
      
      // First try direct access for better performance
      const directRole = localStorage.getItem('role');
      if (directRole) {
        logger.info('Retrieved role directly from localStorage:', directRole);
        return directRole;
      }
      
      // Try to get role from user object as fallback
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.role) {
            // Store it directly for future use
            try {
              localStorage.setItem('role', user.role);
              logger.info('Stored role from user object to localStorage:', user.role);
            } catch (err) {
              logger.warn('Could not cache role in localStorage:', err);
            }
            return user.role;
          }
        } catch (e) {
          // Fall through to legacy method
        }
      }
      
      // Legacy method
      return localStorage.getItem('role');
    } catch (e) {
      logger.warn('Error getting user role:', e);
      return null;
    }
  },
    getName: () => {
    try {
      if (!checkStorageAvailable()) return null;
      
      // Try to get name from user object first
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.name) return user.name;
        } catch (e) {
          // Fall through to legacy method
        }
      }
      
      // Legacy method
      return localStorage.getItem('name');
    } catch (e) {
      logger.warn('Error getting user name:', e);
      return null;
    }
  },
  // User info related helpers (non-sensitive)
  setUserInfo: (data) => {
    try {
      if (!checkStorageAvailable()) return false;
      if (!data) {
        logger.warn('No user info provided');
        return false;
      }
      
      // Only store non-sensitive user data
      if (data.role) localStorage.setItem('role', data.role);
      if (data.name) localStorage.setItem('name', data.name);
      if (data.userId || data.id) localStorage.setItem('userId', data.userId || data.id);
      
      return true;
    } catch (e) {
      logger.warn('Error setting user info:', e);
      return false;
    }
  },
    // Set complete user object
  setUser: (user) => {
    try {
      if (!checkStorageAvailable()) return false;
      if (!user) {
        logger.warn('No user data provided');
        return false;
      }
      
      // Store the complete user object
      localStorage.setItem('user', JSON.stringify(user));
      
      // Also store individual properties for backward compatibility
      if (user.role) localStorage.setItem('role', user.role);
      if (user.name) localStorage.setItem('name', user.name);
      if (user.userId || user.id) localStorage.setItem('userId', user.userId || user.id);
      
      logger.info('User data saved successfully');
      return true;
    } catch (e) {
      logger.error('Error saving user data:', e);
      return false;
    }
  },
    // Get complete user object
  getUser: () => {
    try {
      if (!checkStorageAvailable()) return null;
      
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        // Try to construct from individual properties
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role');
        const name = localStorage.getItem('name');
        
        if (userId || role || name) {
          const user = { id: userId, role, name };
          // Save this constructed user for future use
          try {
            localStorage.setItem('user', JSON.stringify(user));
          } catch (e) {
            // Ignore error, just return the constructed user
          }
          return user;
        }
        
        return null;
      }
      
      try {
        return JSON.parse(userStr);
      } catch (parseError) {
        logger.error('Error parsing user data:', parseError);
        return null;
      }
    } catch (e) {
      logger.error('Error retrieving user data:', e);
      return null;
    }
  },
    clearUserInfo: () => {
    try {
      if (!checkStorageAvailable()) return false;
      
      // Clear user-related items
      const userItems = ['role', 'name', 'userId', 'user'];
      userItems.forEach(item => {
        try {
          localStorage.removeItem(item);
        } catch (err) {
          logger.warn(`Could not remove ${item} from storage`, err);
        }
      });
      
      return true;
    } catch (e) {
      logger.warn('Error clearing user info:', e);
      return false;
    }
  }
};

// Export as default to maintain consistent export pattern
export default storageUtils;
