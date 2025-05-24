// src/hooks/useApiData.js
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import logger from '../utils/logger';

/**
 * Custom hook for fetching data from the API with caching
 * @param {string} endpoint - API endpoint to fetch data from
 * @param {Object} options - Options for fetching data
 * @param {boolean} options.useCache - Whether to use cache (default: true)
 * @param {number} options.cacheExpiryMinutes - Cache expiry time in minutes (default: 5)
 * @param {boolean} options.skipInitialFetch - Skip initial fetch (default: false)
 * @returns {Object} { data, loading, error, refetch }
 */
export const useApiData = (
  endpoint, 
  { useCache = true, cacheExpiryMinutes = 5, skipInitialFetch = false } = {}
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skipInitialFetch);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.get(endpoint, {
        useCache,
        cacheExpiryMinutes,
        forceRefresh
      });
      setData(result);    } catch (err) {
      setError(err);
      logger.error(`Error fetching data from ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, useCache, cacheExpiryMinutes]);

  useEffect(() => {
    if (!skipInitialFetch) {
      fetchData();
    }
  }, [fetchData, skipInitialFetch]);

  // Return the data, loading state, error, and a way to refetch data
  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true), // Force refresh when refetching
  };
};

/**
 * Custom hook for posting data to the API
 * @returns {Object} { postData, posting, error }
 */
export const useApiPost = () => {
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  const postData = useCallback(async (endpoint, data, invalidateCache = true) => {
    setPosting(true);
    setError(null);

    try {
      const result = await apiService.post(endpoint, data, invalidateCache);
      setPosting(false);
      return result;
    } catch (err) {
      setError(err);
      setPosting(false);
      throw err;
    }
  }, []);

  return {
    postData,
    posting,
    error
  };
};

/**
 * Custom hook for deleting data from the API
 * @returns {Object} { deleteData, deleting, error }
 */
export const useApiDelete = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteData = useCallback(async (endpoint, options = {}) => {
    setDeleting(true);
    setError(null);

    try {
      // Always refresh CSRF token for DELETE operations
      const deleteOptions = {
        ...options,
        refreshCsrf: true
      };
      
      const result = await apiService.delete(endpoint, deleteOptions);
      setDeleting(false);
      return result;
    } catch (err) {
      setError(err);
      setDeleting(false);
      throw err;
    }
  }, []);

  return {
    deleteData,
    deleting,
    error
  };
};

/**
 * Custom hook for updating data in the API
 * @returns {Object} { updateData, updating, error }
 */
export const useApiUpdate = () => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateData = useCallback(async (endpoint, data, invalidateCache = true) => {
    setUpdating(true);
    setError(null);

    try {
      const result = await apiService.put(endpoint, data, invalidateCache);
      setUpdating(false);
      return result;
    } catch (err) {
      setError(err);
      setUpdating(false);
      throw err;
    }
  }, []);

  return {
    updateData,
    updating,
    error
  };
};
