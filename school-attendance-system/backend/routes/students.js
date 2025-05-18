// routes/students.js

const express = require('express');
const Student = require('../models/Student'); // Import the student model
const authMiddleware = require('../middlewares/authMiddleware'); // Import the authentication middleware
const router = express.Router();

// Add a new student (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, surname, parentName, parentEmail, parentPhone, grade } = req.body;

    // Check for missing required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!surname) missingFields.push('surname');
    if (!parentName) missingFields.push('parentName');
    if (!parentEmail) missingFields.push('parentEmail');
    if (!parentPhone) missingFields.push('parentPhone');
    if (!grade) missingFields.push('grade');

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Please provide all required fields.',
        missingFields,
      });
    }

    // Create a new student record
    const newStudent = new Student({
      name,
      surname,
      parentName,
      parentEmail,
      parentPhone,
      grade,
    });

    await newStudent.save();

    res.status(201).json({ message: 'Student added successfully', student: newStudent });
  } catch (error) {
    console.error('Error adding student:', error.message);
    if (error.name === 'ValidationError') {
      // Extract validation errors
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    res.status(500).json({ message: 'Error adding student', error: error.message });
  }
});

// View all students or filter by grade (requires authentication)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { grade } = req.query;
    const query = grade ? { grade } : {};
    const students = await Student.find(query);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

// Get student by UUID 'id' (GET /api/students/by-id/:id)
router.get('/by-id/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Received request for student ID:', req.params.id);
    const student = await Student.findOne({ id: req.params.id });

    if (!student) {
      console.log('Student not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Student not found.' });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student:', error.message);
    res.status(500).json({ message: 'Error fetching student.', error: error.message });
  }
});

// Update student by UUID 'id' (PUT /api/students/by-id/:id)
router.put('/by-id/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, parentName, parentEmail, parentPhone, grade } = req.body;

    // Optionally, add validation checks here as well
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!surname) missingFields.push('surname');
    if (!parentName) missingFields.push('parentName');
    if (!parentEmail) missingFields.push('parentEmail');
    if (!parentPhone) missingFields.push('parentPhone');
    if (!grade) missingFields.push('grade');

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Please provide all required fields.',
        missingFields,
      });
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { id },
      { name, surname, parentName, parentEmail, parentPhone, grade },
      { new: true, runValidators: true } // Add runValidators to enforce validation on update
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error.message);
    if (error.name === 'ValidationError') {
      // Extract validation errors
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
});

// Delete student by UUID 'id' (DELETE /api/students/by-id/:id)
router.delete('/by-id/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findOneAndDelete({ id });

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error.message);
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
});

// Get students by grade (GET /api/students/byGrade/:grade)
router.get('/byGrade/:grade', authMiddleware, async (req, res) => {
  try {
    const { grade } = req.params;
    
    if (!grade) {
      return res.status(400).json({ message: 'Grade parameter is required' });
    }
    
    const students = await Student.find({ grade });
    
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students by grade:', error.message);
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

module.exports = router;





