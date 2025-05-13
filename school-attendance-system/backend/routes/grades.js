// routes/grades.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const authMiddleware = require('../middlewares/authMiddleware'); // Import the authentication middleware

// Get list of grades (Only accessible by authenticated users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const grades = await Student.distinct('grade');
    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ message: 'Error fetching grades' });
  }
});

module.exports = router;
