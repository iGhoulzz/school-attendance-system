// models/Student.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID
const validator = require('validator'); // Import validator for email validation

const studentSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, default: () => uuidv4() }, // Use UUID as default function
    name: { type: String, required: true },
    surname: { type: String, required: true },
    parentName: { type: String, required: true },
    parentEmail: {
      type: String,
      required: true,
      validate: {
        validator: function (email) {
          return validator.isEmail(email);
        },
        message: 'Invalid email address.',
      },
    },
    parentPhone: { type: String, required: true },
    grade: { type: String, required: true }, // Add grade field to categorize students
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure virtuals are included when converting documents to JSON
studentSchema.set('toObject', { virtuals: true });
studentSchema.set('toJSON', { virtuals: true });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;

