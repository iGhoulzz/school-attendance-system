// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher'); // Import Teacher model
const Admin = require('../models/Admin'); // Import Admin model
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
      // Compare the password for Admin
      const isMatch = await bcrypt.compare(password, admin.password);
      if (isMatch) {
        console.log('Admin login successful, generating token');
        // Generate token for Admin
        const token = jwt.sign(
          { userId: admin._id, role: 'admin' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        // Include admin's name in the response
        return res.json({
          token,
          role: 'admin',
          userId: admin._id,
          name: admin.name,
        });
      } else {
        console.log('Password mismatch for admin');
        // Return generic error message
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    // If not Admin, check for Teacher account
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
        // Include teacher's name in the response
        return res.json({
          token,
          role: 'teacher',
          userId: teacher._id,
          name: teacher.name,
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

// Token validation route
router.get('/validate', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
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

module.exports = router;








