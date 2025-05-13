// routes/teachers.js
const express = require('express');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher'); // Import the teacher model
const authMiddleware = require('../middlewares/authMiddleware'); // Import the authentication middleware

const router = express.Router();

// Get all teachers (requires authentication and admin role)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const teachers = await Teacher.find().select('-password'); // Exclude password
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
});

// Create a new teacher (requires authentication and admin role)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    let { name, surname, email, password } = req.body;

    // Validate input
    if (!name || !surname || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Trim email and password to avoid any extra spaces
    email = email.trim();
    password = password.trim();

    // Check if the email is already registered
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new teacher (password hashing is handled by the pre-save hook)
    const newTeacher = new Teacher({ name, surname, email, password });

    await newTeacher.save();
    console.log(`New teacher created: ${newTeacher.email}`);
    res.status(201).json({ message: 'Teacher created successfully', teacher: newTeacher });
  } catch (error) {
    console.error('Error creating teacher:', error.message);
    res.status(500).json({ message: 'Error creating teacher', error: error.message });
  }
});

// Update a teacher's details (requires authentication and admin role)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { id } = req.params;
    let { name, surname, email, password } = req.body;

    // Trim email and password to avoid any extra spaces
    email = email.trim();
    if (password) password = password.trim();

    const updatedData = { name, surname, email };
    if (password) {
      updatedData.password = password; // Password will be hashed by pre-save hook
      console.log(`Updated password for teacher with ID ${id}`);
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(updatedTeacher);
  } catch (error) {
    console.error('Error updating teacher:', error.message);
    res.status(500).json({ message: 'Error updating teacher', error: error.message });
  }
});

// Delete a teacher (requires authentication and admin role)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { id } = req.params;
    await Teacher.findByIdAndDelete(id);
    console.log(`Teacher deleted with ID ${id}`);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error.message);
    res.status(500).json({ message: 'Error deleting teacher', error: error.message });
  }
});

module.exports = router;





