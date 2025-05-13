const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin'); // Import Admin model
const authMiddleware = require('../middlewares/authMiddleware'); // Import the auth middleware

const router = express.Router();

// Create a new admin (e.g., to add another admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email is already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, email, password: hashedPassword });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
});

// Get all admins (only accessible by super admins, if applicable)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error: error.message });
  }
});

// Update an admin's details
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const updatedData = { name, email };
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10); // Hash the new password
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(updatedAdmin);
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin', error: error.message });
  }
});

// Delete an admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await Admin.findByIdAndDelete(id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin', error: error.message });
  }
});

module.exports = router;
