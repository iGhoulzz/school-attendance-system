# Migration from localStorage to HTTP-only Cookies

## Overview
This document describes the changes made to migrate authentication from localStorage to HTTP-only cookies for enhanced security.

## Why HTTP-only Cookies?
HTTP-only cookies provide stronger security compared to localStorage:
- They are not accessible via JavaScript, protecting against XSS attacks
- They are automatically sent with requests to the same origin
- When combined with other flags (Secure, SameSite), they provide robust protection

## Changes Implemented

### Backend Changes
1. Updated the authentication routes to set HTTP-only cookies:
   ```javascript
   res.cookie('token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     maxAge: 60 * 60 * 1000 // 1 hour
   });
   ```

2. Added refresh token support:
   ```javascript
   res.cookie('refreshToken', refreshToken, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     path: '/api/auth/refresh-token',
     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
   });
   ```

3. Created a token refresh endpoint to allow automatic token renewal:
   ```javascript
   router.post('/refresh-token', async (req, res) => {
     // Get refresh token from cookies
     const refreshToken = req.cookies.refreshToken;
     // ... validation logic
     // Generate new access token
     // Set new access token cookie
   });
   ```

4. Added logout endpoint to properly clear cookies:
   ```javascript
   router.post('/logout', (req, res) => {
     res.clearCookie('token');
     res.clearCookie('refreshToken');
     return res.status(200).json({ message: 'Logged out successfully' });
   });
   ```

5. Enhanced the auth middleware to check cookies first:
   ```javascript
   const cookieToken = req.cookies.token;
   // Then fall back to Authorization header for backward compatibility
   ```

### Frontend Changes
1. Updated apiService.js to work with cookies:
   - Set `axios.defaults.withCredentials = true` to enable cookie sending
   - Added token refresh functionality
   - Implemented proper error handling for 401 responses

2. Added cookie-aware authentication methods:
   ```javascript
   async login(credentials) {
     // Credentials are sent, cookies are set by the server
     const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
       withCredentials: true
     });
     return response.data;
   }
   
   async logout() {
     // Request to clear cookies on the server
     const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
       withCredentials: true
     });
     return response.data;
   }
   ```

3. Removed localStorage token access from components, using cookie authentication instead

## Migration Path
This implementation supports a gradual migration:
- The backend checks both cookies and Authorization headers
- The frontend sends cookies automatically with requests
- Legacy code using localStorage tokens will continue to work

## Security Considerations
- CSRF tokens are required for all state-changing requests
- Token refresh happens automatically when tokens are about to expire
- Rigorous error handling ensures proper authentication state management
