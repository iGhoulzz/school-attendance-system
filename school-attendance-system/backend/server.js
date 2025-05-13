// server.js
require('dotenv').config(); // If using dotenv to manage environment variables
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');

const teacherRoutes = require('./routes/teachers'); // Import teacher routes
const authRoutes = require('./routes/auth'); // Auth routes
const adminRoutes = require('./routes/admin'); // Import admin routes
const studentRoutes = require('./routes/students'); // Import student routes
const attendanceRoutes = require('./routes/attendance'); //import attend routes
const gradeRoutes = require('./routes/grades'); //import grade routes

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

// MongoDB connection setup
const mongoURI = process.env.MONGO_URI; // Use environment variable

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Auth routes
app.use('/api/auth', authRoutes); // Use auth routes

// Teacher management routes
app.use('/api/teachers', teacherRoutes); // Use teacher routes

// Admin management routes
app.use('/api/admin', adminRoutes); // Use admin routes

// Student management routes
app.use('/api/students', studentRoutes); // Use student routes

// Attend management routes
app.use('/api/attendance', attendanceRoutes);

// grade routes
app.use('/api/grades', gradeRoutes);

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});





