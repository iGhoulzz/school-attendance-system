# Security Fixes for School Attendance System

After thorough review of the codebase, here are the security issues and their fixes:

## 1. Fix Syntax Error in fetchNotifications

The following error needs to be fixed first:
```
SyntaxError: Unexpected token, expected "," (303:3)
```

This is caused by a missing dependency array in the useCallback hook:

```javascript
// FROM:
const fetchNotifications = useCallback(async () => {
  try {
    const response = await apiService.get('/notifications');
    setNotifications(response);
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
}; // <- Missing dependency array and using semicolon instead of comma

// TO:
const fetchNotifications = useCallback(async () => {
  try {
    const response = await apiService.get('/notifications');
    setNotifications(response);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
  }
}, [apiService]); // Add proper dependencies
```

## 2. Apply DOMPurify to User Content

All user-supplied content should be sanitized with DOMPurify:

```javascript
// Import at the top
import DOMPurify from 'dompurify';

// Then use it when rendering user-supplied content:

// BEFORE:
<Typography variant="body2" fontWeight="bold">
  {notification.title}
</Typography>
<Typography variant="caption">
  {notification.message.substring(0, 30)}
</Typography>

// AFTER:
<Typography variant="body2" fontWeight="bold">
  {DOMPurify.sanitize(notification.title)}
</Typography>
<Typography variant="caption">
  {DOMPurify.sanitize(notification.message.substring(0, 30))}
</Typography>
```

Apply this to all places rendering notification.title and notification.message, including:
- Menu items in the notification dropdown
- Dialog content when viewing a notification

## 3. Replace console.error with Secure Logger

Create a new logger utility that's aware of the environment:

```javascript
// src/utils/logger.js
const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  error: (message, ...args) => {
    if (isDev) {
      console.error(message, ...args);
    } else {
      // In production, we could send to an error monitoring service
      // For now, just log a sanitized version without sensitive data
      console.error(`Error: ${message.split(':')[0]}`);
    }
  },
  warn: (message, ...args) => {
    if (isDev) {
      console.warn(message, ...args);
    }
  },
  info: (message, ...args) => {
    if (isDev) {
      console.info(message, ...args);
    }
  }
};
```

Then replace all console.error calls:

```javascript
// BEFORE:
console.error('Error during logout:', error);

// AFTER:
import { logger } from '../utils/logger';
logger.error('Error during logout:', error);
```

## 4. Fix useEffect Dependencies

Update the useEffect for notifications with proper dependencies:

```javascript
// BEFORE:
useEffect(() => {
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 60000);
  return () => clearInterval(interval);
}, []); // Missing fetchNotifications dependency

// AFTER:
useEffect(() => {
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 60000);
  return () => clearInterval(interval);
}, [fetchNotifications]); // Add fetchNotifications dependency
```

## 5. Improve API Error Handling

Add better error handling for all API calls:

```javascript
try {
  await apiService.post(`/notifications/${notification.id}/read`, {});
  fetchNotifications();
} catch (error) {
  logger.error('Error handling notification:', error);
  // Add user-friendly error handling:
  if (error.response) {
    // Server responded with error status
    if (error.response.status === 401) {
      handleLogout(); // Unauthorized - log out
    } else {
      // Show appropriate message based on status
    }
  } else if (error.request) {
    // Request made but no response (network issue)
  } else {
    // Something else happened
  }
}
```

## Implementation Checklist

1. [ ] Fix the fetchNotifications useCallback syntax error
2. [ ] Create a secure logger utility in src/utils/logger.js
3. [ ] Add DOMPurify import and apply to all user content
4. [ ] Replace all console.error calls with logger.error
5. [ ] Fix dependencies in all useCallback and useEffect hooks
6. [ ] Add comprehensive error handling for all API calls

After implementing these changes, the application will be more secure and robust against common vulnerabilities.
