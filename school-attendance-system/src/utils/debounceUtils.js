// src/utils/debounceUtils.js
import { debounce } from 'lodash';

/**
 * Create a debounced version of a function
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay (default: 300ms)
 * @param {Object} options - The options object
 * @param {boolean} options.leading - Specify invoking on the leading edge of the timeout (default: false)
 * @param {boolean} options.trailing - Specify invoking on the trailing edge of the timeout (default: true)
 * @returns {Function} Debounced function
 */
export const createDebouncedFunction = (
  func,
  wait = 300,
  { leading = false, trailing = true } = {}
) => debounce(func, wait, { leading, trailing });

/**
 * Create a debounced input change handler
 *
 * @param {Function} handler - The change handler function
 * @param {number} delay - The delay in milliseconds (default: 300ms)
 * @returns {Function} Debounced input change handler
 */
export const createDebouncedInputHandler = (handler, delay = 300) => {
  return createDebouncedFunction((e) => {
    handler(e);
  }, delay);
};

/**
 * Create a debounced button click handler
 *
 * @param {Function} handler - The click handler function
 * @param {number} delay - The delay in milliseconds (default: 300ms)
 * @param {boolean} immediate - Whether to invoke the function on the leading edge (default: true)
 * @returns {Function} Debounced button click handler
 */
export const createDebouncedClickHandler = (handler, delay = 300, immediate = true) => {
  return createDebouncedFunction(
    (...args) => {
      handler(...args);
    },
    delay,
    { leading: immediate, trailing: !immediate }
  );
};

/**
 * Create a debounced search handler
 *
 * @param {Function} searchFunction - The search function
 * @param {number} delay - The delay in milliseconds (default: 500ms)
 * @returns {Function} Debounced search handler
 */
export const createDebouncedSearchHandler = (searchFunction, delay = 500) => {
  return createDebouncedFunction(searchFunction, delay);
};
