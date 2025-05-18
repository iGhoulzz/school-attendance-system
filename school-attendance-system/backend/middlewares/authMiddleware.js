// authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
require('dotenv').config();

// Helper function to check if token is about to expire (within 5 minutes)
const isTokenNearExpiry = (decodedToken) => {
  const expiryTime = decodedToken.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const timeUntilExpiry = expiryTime - currentTime;
  return timeUntilExpiry < 5 * 60 * 1000; // Less than 5 minutes
};

// Helper function to generate a new access token
const generateNewAccessToken = async (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const authMiddleware = async (req, res, next) => {
  try {
    // First check for token in HTTP-only cookie
    const cookieToken = req.cookies.token;
    
    // Fall back to Authorization header if cookie not present (for backwards compatibility)
    const authHeader = req.headers.authorization;
    
    // Use cookie token if available, otherwise use header token
    let token;
    
    if (cookieToken) {
      token = cookieToken;
      console.log('Using token from HTTP-only cookie');
    } else if (authHeader) {
      token = authHeader.split(' ')[1];
      console.log('Using token from Authorization header');
    } else {
      console.log('No token found in cookie or Authorization header');
      return res.status(401).json({ message: 'Authentication failed!' });
    }    // Verify the token
    let decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is about to expire and we have a refresh token
    const refreshToken = req.cookies.refreshToken;
    if (isTokenNearExpiry(decodedToken) && refreshToken) {
      try {        // Verify refresh token
        const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        // Find user to ensure they still exist
        let user;
        if (decodedRefresh.role === 'admin') {
          user = await Admin.findById(decodedRefresh.userId);
        } else if (decodedRefresh.role === 'teacher') {
          user = await Teacher.findById(decodedRefresh.userId);
        }
        
        if (user) {
          // Generate new access token
          const newToken = await generateNewAccessToken(user._id, decodedRefresh.role);
          
          // Set new token in cookie
          res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 1 hour
          });
          
          // Update decoded token with new values
          decodedToken = jwt.verify(newToken, process.env.JWT_SECRET);
        }
      } catch (refreshError) {
        console.log('Error refreshing token within middleware:', refreshError.message);
        // Continue with the current token if refresh fails
      }
    }

    req.userId = decodedToken.userId;
    req.role = decodedToken.role;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Authentication failed!' });
  }
};

module.exports = authMiddleware;

