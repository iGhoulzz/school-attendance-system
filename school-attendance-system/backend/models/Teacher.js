// models/Teacher.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // To hash passwords

const teacherSchema = new mongoose.Schema({
  // Remove custom 'id' field
  name: { type: String, required: true },
  surname: { type: String, required: true }, // Include surname if needed
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  grades: [String], // List of grades the teacher teaches
  createdAt: { type: Date, default: Date.now },
});

// Hash the password before saving
teacherSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
teacherSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;

