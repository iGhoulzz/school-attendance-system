// Script to check if all necessary components are initialized
// This will run on app startup to verify environment and browser capabilities

// Check if running in iframe (potential restricted context)
function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.self or window.top, we're likely in a restricted context
    return true;
  }
}

// Check for storage capabilities
function checkStorageCapabilities() {
  const results = {
    localStorage: false,
    sessionStorage: false,
    cookies: false,
    inIframe: false,
    errors: []
  };
  
  // Check if in browser environment
  if (typeof window === 'undefined') {
    results.errors.push('Not in browser environment');
    return results;
  }
  
  // Check if running in iframe
  results.inIframe = isInIframe();
  if (results.inIframe) {
    results.errors.push('Running in iframe - storage access may be restricted');
  }
  
  try {
    // Check localStorage
    if (window.localStorage) {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      results.localStorage = true;
    }
  } catch (e) {
    results.errors.push(`localStorage not available: ${e.message}`);
  }
  
  try {
    // Check sessionStorage
    if (window.sessionStorage) {
      const testKey = '__storage_test__';
      window.sessionStorage.setItem(testKey, testKey);
      window.sessionStorage.removeItem(testKey);
      results.sessionStorage = true;
    }
  } catch (e) {
    results.errors.push(`sessionStorage not available: ${e.message}`);
  }
  
  try {
    // Check cookies
    if (typeof document !== 'undefined' && navigator.cookieEnabled) {
      document.cookie = "testcookie=1; SameSite=Strict; Secure";
      results.cookies = document.cookie.indexOf("testcookie=") !== -1;
      document.cookie = "testcookie=1; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  } catch (e) {
    results.errors.push(`Cookies not available: ${e.message}`);
  }
  
  return results;
}

// Check browser features
function checkBrowserFeatures() {
  if (typeof window === 'undefined') return { errors: ['Not in browser environment'] };
  
  const results = {
    online: navigator.onLine,
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenSize: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    errors: []
  };
  
  // Check for third-party cookie restrictions
  if (navigator.cookieEnabled && document.cookie.indexOf('testcookie=') === -1) {
    results.errors.push('Third-party cookies may be blocked');
  }
  
  // Check for Privacy/Incognito mode (indirect detection)
  try {
    // Non-async approach to avoid await
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(storageQuota => {
        if (storageQuota && storageQuota.quota < 120000000) {
          // Usually incognito mode has lower storage limits
          results.errors.push('Possible private/incognito browsing mode detected (limited storage)');
          console.warn('Possible private/incognito browsing mode detected (limited storage)');
        }
      }).catch(() => {
        // Ignore errors
      });
    }
  } catch (e) {
    // Storage API not available, can't detect
  }
  
  return results;
}

// Initialize the application with environment checks
export function initializeApp() {
  const storage = checkStorageCapabilities();
  const browserFeatures = checkBrowserFeatures();
  
  // Create a unified error list
  const errors = [...storage.errors, ...browserFeatures.errors];
  const warnings = [];
  
  // Check if we have critical issues
  const hasCriticalStorageIssues = !storage.localStorage && !storage.sessionStorage;
  
  if (hasCriticalStorageIssues) {
    errors.push('CRITICAL: No storage mechanism available - app functionality will be limited');
  }
  
  if (!storage.cookies) {
    warnings.push('WARNING: Cookies are disabled. Authentication may not work properly');
  }
  
  // Log all issues in development
  if (process.env.NODE_ENV === 'development' || errors.length > 0) {
    console.info('App Initialization:', {
      timestamp: new Date().toISOString(),
      storage,
      browserFeatures,
      environment: process.env.NODE_ENV,
      errors,
      warnings
    });
  }
  
  if (errors.length > 0) {
    console.warn('🚨 App initialization issues:', errors);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ App initialization warnings:', warnings);
  }
  
  return {
    success: !hasCriticalStorageIssues,
    storage,
    browserFeatures,
    errors,
    warnings
  };
}

export { checkStorageCapabilities, checkBrowserFeatures, isInIframe };

export default { initializeApp, checkStorageCapabilities, checkBrowserFeatures, isInIframe };
