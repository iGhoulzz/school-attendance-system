// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Teacher = require('../models/Teacher'); // Import Teacher model
const Admin = require('../models/Admin'); // Import Admin model
const { sendEmail, sendPasswordResetEmail } = require('../models/emailService'); // Import email service
const authMiddleware = require('../middlewares/authMiddleware'); // Import auth middleware
require('dotenv').config(); // Load environment variables

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  let { email, password } = req.body;

  // Trim email and password to avoid any extra spaces causing mismatches
  email = email.trim();
  password = password.trim();

  console.log('Login attempt:', { email });
  try {
    // Check for Admin account first
    const admin = await Admin.findOne({ email });
    if (admin) {
      console.log('Admin account found, attempting password comparison...');
      // Compare the password for Admin using the method
      const isMatch = await admin.comparePassword(password);
      if (isMatch) {
        console.log('Admin login successful, generating token');
        // Generate token for Admin
        const token = jwt.sign(
          { userId: admin._id, role: 'admin' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
          // Generate refresh token
        const refreshToken = jwt.sign(
          { userId: admin._id, role: 'admin' },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '7d' }
        );
        
        // Set HTTP-only cookies
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 1000 // 1 hour
        });
        
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/api/auth/refresh-token', // Restrict to refresh endpoint
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
          // Include admin's name and token in the response
        return res.json({
          role: 'admin',
          userId: admin._id,
          name: admin.name,
          token: token, // Include token in response body as well for backward compatibility
          user: {
            id: admin._id,
            role: 'admin',
            name: admin.name
          }
        });
      } else {
        console.log('Password mismatch for admin');
        // Return generic error message
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }    // If not Admin, check for Teacher account
    console.log('Attempting to find teacher account...');
    const teacher = await Teacher.findOne({ email });
    if (teacher) {
      console.log('Teacher found, attempting password comparison...');

      // Use the comparePassword method from the Teacher model
      const isMatch = await teacher.comparePassword(password);
      console.log('Password match for teacher:', isMatch);
      if (isMatch) {
        console.log('Teacher login successful, generating token');
        // Generate token for Teacher
        const token = jwt.sign(
          { userId: teacher._id, role: 'teacher' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
          // Generate refresh token
        const refreshToken = jwt.sign(
          { userId: teacher._id, role: 'teacher' },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '7d' }
        );
        
        // Set HTTP-only cookies
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 1000 // 1 hour
        });
        
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/api/auth/refresh-token',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
          // Include teacher's name and token in the response
        return res.json({
          role: 'teacher',
          userId: teacher._id,
          name: teacher.name,
          token: token, // Include token in response body as well for backward compatibility
          user: {
            id: teacher._id,
            role: 'teacher',
            name: teacher.name
          }
        });
      } else {
        console.log('Password mismatch for teacher');
        // Return generic error message
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    // If no match found
    console.log('No matching admin or teacher found for:', email);
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// Request password reset
router.post('/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Look for user in both Admin and Teacher models
    const admin = await Admin.findOne({ email });
    const teacher = await Teacher.findOne({ email });
    const user = admin || teacher;

    if (!user) {
      return res.status(404).json({ message: 'No account found with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    
    // Create reset URL - with token hashed and encoded to prevent leakage in logs and referrer headers
    const tokenId = require('crypto').randomBytes(16).toString('hex');
    
    // Store the mapping in a temporary redis store or session (simulating with global object for now)
    if (!global.passwordResetTokens) {
      global.passwordResetTokens = {};
    }
    
    // Store token with a short expiry
    global.passwordResetTokens[tokenId] = {
      resetToken: resetToken,
      expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
    };
    
    // Only pass the token ID in the URL
    const resetUrl = `http://localhost:3000/reset-password?id=${tokenId}`;
    
    // Send email
    await sendPasswordResetEmail({
      to: email,
      resetToken: resetToken, // This should be removed from the email too in production
      resetUrl: resetUrl
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Error requesting password reset' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { tokenId, newPassword } = req.body;
    
    if (!tokenId || !newPassword) {
      return res.status(400).json({ message: 'Token ID and new password are required' });
    }
    
    // Retrieve the actual token using the token ID
    if (!global.passwordResetTokens || !global.passwordResetTokens[tokenId]) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Check if token has expired
    const tokenData = global.passwordResetTokens[tokenId];
    if (Date.now() > tokenData.expiresAt) {
      // Clean up expired token
      delete global.passwordResetTokens[tokenId];
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    
    // Get the actual token
    const token = tokenData.resetToken;
    
    console.log(`Processing password reset for token: ${token.substring(0, 10)}...`);
    
    // Look for user with valid reset token
    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    const teacher = await Teacher.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    const user = admin || teacher;

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    console.log(`Found user with email: ${user.email} for password reset`);
    
    // Create a hashed password directly instead of using pre-save middleware
    // This avoids potential double-hashing issues
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user model directly based on type
    if (admin) {
      await Admin.updateOne(
        { _id: user._id },
        { 
          $set: { 
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
          }
        }
      );
    } else {
      await Teacher.updateOne(
        { _id: user._id },
        { 
          $set: { 
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
          }
        }
      );
    }    
    console.log(`Password reset successful for user ${user.email}`);

    // Clean up the tokenId from our storage
    delete global.passwordResetTokens[tokenId];

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// Token validation route
router.get('/validate', (req, res) => {
  // First check token from cookie
  const cookieToken = req.cookies.token;
  
  // Then check Authorization header as fallback
  const authHeader = req.headers.authorization;
  const headerToken = authHeader && authHeader.split(' ')[1];
  
  // Use cookie token if available, otherwise header token
  const token = cookieToken || headerToken;
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication failed!' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      valid: true,
      role: decodedToken.role,
      userId: decodedToken.userId,
    });
  } catch (error) {
    console.error('Token validation failed:', error.message);
    res.status(401).json({ message: 'Token validation failed' });
  }
});

// Token refresh route
router.post('/refresh-token', async (req, res) => {
  // Get refresh token from cookies
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }
  
  try {    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Find user based on decoded info
    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.userId);
    } else if (decoded.role === 'teacher') {
      user = await Teacher.findById(decoded.userId);
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate new access token
    const newToken = jwt.sign(
      { userId: user._id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Set new access token in HTTP-only cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    
    return res.status(200).json({ 
      message: 'Token refreshed successfully',
      user: {
        id: user._id,
        name: user.name,
        role: decoded.role
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // Clear auth cookies
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh-token'
  });
  
  return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;








