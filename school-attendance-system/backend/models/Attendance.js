// models/Attendance.js

const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  studentId: { type: String, required: true }, // UUID string
  status: { type: String, enum: ['Present', 'Absent'], required: true },
});

// Add virtual field 'student' to attendanceRecordSchema
attendanceRecordSchema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',    // Field in attendanceRecordSchema
  foreignField: 'id',         // Field in Student model
  justOne: true,
});

// Ensure virtuals are included when converting documents to JSON
attendanceRecordSchema.set('toObject', { virtuals: true });
attendanceRecordSchema.set('toJSON', { virtuals: true });

// Attendance schema
const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  grade: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  records: [attendanceRecordSchema],
});

module.exports = mongoose.model('Attendance', attendanceSchema);



