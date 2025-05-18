# ESM Import Fixes

## Problem Summary

The application was experiencing issues with the following error:
```
Cannot read properties of undefined (reading 'get')
```

This error occurred because the code was mixing CommonJS (`require()`) and ES modules (`import`) styles, which doesn't work properly in the browser environment. The CommonJS `require()` calls were returning an empty object instead of the proper module exports.

## Files Fixed

1. **src/components/Dashboard.js**
   - Changed from `const apiService = require('../services/apiService')` to proper ES module import
   - Added `import apiService from '../services/apiService'` at the top of the file

2. **src/components/Login.js**
   - Added `import apiService from '../services/apiService'` at the top of the file
   - Removed runtime `require('../services/apiService').default` call

3. **src/services/apiServiceWrapper.js**
   - Added `import apiService from './apiService'` at the top of the file
   - Removed redundant `require('./apiService').default` calls in both `login()` and `logout()` methods

4. **src/components/RecordAttendance.js**
   - Added `import apiService from '../services/apiService'` at the top of the file
   - Removed runtime `require('../services/apiService').default` calls

5. **src/components/AttendanceReports.js**
   - Added `import apiService from '../services/apiService'` at the top of the file
   - Removed runtime `require('../services/apiService').default` call

6. **src/components/AdminManagement.js**
   - Added `import apiService from '../services/apiService'` at the top of the file
   - Removed runtime `require('../services/apiService').default` call

## Why This Solution Works

ES modules (`import/export`) and CommonJS (`require/module.exports`) are different module systems:

1. In a browser environment with webpack/babel (like Create-React-App or Vite), mixing these can cause issues
2. The browser environment transforms `import` statements to use a special loader, but runtime `require()` calls don't go through this transformation
3. By consistently using the ES modules pattern (`import`), we ensure that all modules are loaded correctly

No utility/testing scripts (which run in Node.js directly) were modified as they correctly use the CommonJS pattern.

## Testing Recommendation

After making these changes, the following features should be tested:
- Login functionality
- CSRF token acquisition
- Sending attendance alerts
- Creating admin users
- Recording attendance
