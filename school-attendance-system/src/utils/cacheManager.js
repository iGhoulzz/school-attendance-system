// src/utils/cacheManager.js
/**
 * A simple cache management utility to store and retrieve API responses
 * with configurable expiration time
 */

class CacheManager {
  constructor() {
    this.cache = {};
  }

  /**
   * Set a value in the cache with an expiration time
   * @param {string} key - The cache key
   * @param {any} value - The value to cache
   * @param {number} expirationTimeInMinutes - Cache expiration time in minutes (default: 5)
   */
  set(key, value, expirationTimeInMinutes = 5) {
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + expirationTimeInMinutes);

    this.cache[key] = {
      value,
      expiresAt: expirationTime
    };
  }

  /**
   * Get a value from the cache
   * @param {string} key - The cache key
   * @returns {any|null} - The cached value or null if expired or not found
   */
  get(key) {
    const cacheEntry = this.cache[key];
    
    if (!cacheEntry) {
      return null;
    }

    // Check if the entry has expired
    if (new Date() > cacheEntry.expiresAt) {
      this.delete(key);
      return null;
    }

    return cacheEntry.value;
  }

  /**
   * Delete a value from the cache
   * @param {string} key - The cache key
   */
  delete(key) {
    delete this.cache[key];
  }

  /**
   * Clear the entire cache
   */
  clear() {
    this.cache = {};
  }

  /**
   * Get all active (non-expired) keys in the cache
   * @returns {string[]} - Array of active cache keys
   */
  getActiveKeys() {
    const now = new Date();
    return Object.keys(this.cache).filter(key => {
      return now < this.cache[key].expiresAt;
    });
  }
}

// Create a singleton instance
const cacheManager = new CacheManager();

export default cacheManager;
