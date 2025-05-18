// Utility to safely handle localStorage operations
const isStorageAvailable = () => {
  try {
    // Check if we're in a browser context
    if (typeof window === 'undefined' || !window.localStorage) return false;
    
    // Test within try/catch to ensure permission issues are caught
    const testKey = '__storage_test__';
    
    // Check for a possible iframe context where localStorage might be restricted
    if (window.self !== window.top) {
      // In an iframe, we need to be careful with localStorage
      console.info('Application is running in an iframe, storage might be restricted');
      try {
        // Attempt to perform a minimal test
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
      } catch (iframeError) {
        console.warn('Storage access denied in iframe context:', iframeError);
        return false;
      }
    }
    
    // Normal browser context test
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('localStorage not available:', e);
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

export const storageUtils = {
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
      console.warn(`Error accessing storage for key ${key}:`, e);
      // Try memory fallback
      return memoryStorage.has(key) ? memoryStorage.get(key) : null;
    }
  },
  
  setItem: (key, value) => {
    try {
      if (!checkStorageAvailable()) {
        // Use memory fallback if localStorage isn't available
        memoryStorage.set(key, value);
        return true;
      }
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn(`Error setting storage for key ${key}:`, e);
      // Try memory fallback
      memoryStorage.set(key, value);
      return true;
    }
  },
  
  removeItem: (key) => {
    try {
      if (!checkStorageAvailable()) {
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
      console.warn(`Error removing key ${key} from storage:`, e);
      // Try memory fallback
      memoryStorage.delete(key);
      return true;
    }
  },
  
  clear: () => {
    try {
      if (!checkStorageAvailable()) {
        // Use memory fallback if localStorage isn't available
        memoryStorage.clear();
        return true;
      }
      localStorage.clear();
      // Also clear memory fallback
      memoryStorage.clear();
      return true;
    } catch (e) {
      console.warn('Error clearing storage:', e);
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
      console.error('Error storing JSON item in localStorage:', error);
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
      console.error('Error getting JSON item from localStorage:', error);
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
      });
      return true;
    } catch (error) {
      console.error('Error clearing namespace from localStorage:', error);
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
      console.warn('Error getting auth token:', e);
      return null;
    }
  },
  clearAuth: () => {
    try {
      if (!checkStorageAvailable()) return false;
      // We don't clear the token from localStorage as it's now in HTTP-only cookies
      // But we do clear other auth-related items
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      localStorage.removeItem('userId');
      return true;
    } catch (e) {
      console.warn('Error clearing auth data:', e);
      return false;
    }
  },
  clearAuthData: () => {
    try {
      if (!checkStorageAvailable()) return false;
      
      // Clear all auth-related items
      const authItems = ['token', 'role', 'name', 'userId'];
      authItems.forEach(item => {
        try {
          localStorage.removeItem(item);
        } catch (err) {
          console.warn(`Could not remove ${item} from storage`, err);
        }
      });
      
      return true;
    } catch (e) {
      console.warn('Error clearing auth data:', e);
      return false;
    }
  },
  getRole: () => {
    try {
      if (!checkStorageAvailable()) return null;
      return localStorage.getItem('role');
    } catch (e) {
      console.warn('Error getting user role:', e);
      return null;
    }
  },
  getName: () => {
    try {
      if (!checkStorageAvailable()) return null;
      return localStorage.getItem('name');
    } catch (e) {
      console.warn('Error getting user name:', e);
      return null;
    }
  },

  // User info related helpers (non-sensitive)
  setUserInfo: (data) => {
    try {
      if (!checkStorageAvailable()) return false;
      if (!data) {
        console.warn('No user info provided');
        return false;
      }
      
      // Only store non-sensitive user data
      if (data.role) localStorage.setItem('role', data.role);
      if (data.name) localStorage.setItem('name', data.name);
      if (data.userId) localStorage.setItem('userId', data.userId);
      
      return true;
    } catch (e) {
      console.warn('Error setting user info:', e);
      return false;
    }
  },
  
  clearUserInfo: () => {
    try {
      if (!checkStorageAvailable()) return false;
      
      // Clear user-related items
      const userItems = ['role', 'name', 'userId'];
      userItems.forEach(item => {
        try {
          localStorage.removeItem(item);
        } catch (err) {
          console.warn(`Could not remove ${item} from storage`, err);
        }
      });
      
      return true;
    } catch (e) {
      console.warn('Error clearing user info:', e);
      return false;
    }
  },
};
