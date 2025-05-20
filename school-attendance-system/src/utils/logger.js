/**
 * Secure logging utility that prevents leaking sensitive information in production
 * 
 * This logger only outputs detailed logs in development mode and can be
 * configured to send errors to a monitoring service in production.
 */
const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  /**
   * Log an error message
   * @param {string} message - The error message
   * @param  {...any} args - Additional arguments
   */
  error: (message, ...args) => {
    if (isDev) {
      console.error(message, ...args);
    } else {
      // In production, we could send to an error monitoring service
      // Example: errorMonitoringService.captureError(message, args);
      
      // For now, just log a sanitized version without potentially sensitive data
      console.error(`Error: ${message.split(':')[0]}`);
    }
  },

  /**
   * Log a warning message
   * @param {string} message - The warning message
   * @param  {...any} args - Additional arguments
   */
  warn: (message, ...args) => {
    if (isDev) {
      console.warn(message, ...args);
    }
  },

  /**
   * Log an informational message (only in development)
   * @param {string} message - The info message
   * @param  {...any} args - Additional arguments
   */
  info: (message, ...args) => {
    if (isDev) {
      console.info(message, ...args);
    }
  },

  /**
   * Log a debug message (only in development)
   * @param {string} message - The debug message
   * @param  {...any} args - Additional arguments
   */
  debug: (message, ...args) => {
    if (isDev) {
      console.debug(message, ...args);
    }
  }
};

export default logger;
