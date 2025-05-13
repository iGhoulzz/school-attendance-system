const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance'); // Attendance model
const Teacher = require('../models/Teacher');       // Teacher model
const Student = require('../models/Student');       // Student model
const authMiddleware = require('../middlewares/authMiddleware'); // Authentication middleware
const { sendEmail } = require('../models/emailService');         // Email service
const winston = require('winston');


// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'attendance.log' })
  ]
});

/**
 * @route   POST /api/attendance
 * @desc    Record attendance for a specific date and grade
 * @access  Private (Authenticated users only)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const teacherId = req.userId; // Extracted from the authentication token
    const { date, grade, records } = req.body;

    // Validate input
    if (!date || !grade || !records || records.length === 0) {
      return res.status(400).json({
        message: 'Date, grade, and attendance records are required.',
      });
    }

    // Verify the teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    // Validate each attendance record
    for (const record of records) {
      if (!record.studentId || !record.status) {
        return res.status(400).json({
          message: 'Each record must contain studentId and status.',
        });
      }
    }

    // Check for duplicate studentIds in the records array
    const studentIds = records.map((record) => record.studentId);
    const uniqueStudentIds = new Set(studentIds);

    if (uniqueStudentIds.size !== studentIds.length) {
      return res.status(400).json({
        message: 'Duplicate attendance records for the same student are not allowed.',
      });
    }

    // Set date to midnight UTC to ensure consistency
    const attendanceDate = new Date(date + 'T00:00:00Z');

    // Check if attendance has already been recorded for this date and grade
    const existingAttendance = await Attendance.findOne({
      date: attendanceDate,
      grade,
    });

    if (existingAttendance) {
      // Check if any of the studentIds already have records
      const existingStudentIds = existingAttendance.records.map(
        (record) => record.studentId.toString()
      );

      const duplicateStudents = studentIds.filter((id) =>
        existingStudentIds.includes(id)
      );

      if (duplicateStudents.length > 0) {
        return res.status(400).json({
          message: 'Attendance for one or more students has already been recorded for this date.',
        });
      }

      // If no duplicates, add new records to existing attendance
      existingAttendance.records.push(...records);
      await existingAttendance.save();

      logger.info('Attendance updated successfully');
      return res.status(200).json({
        message: 'Attendance updated successfully',
        attendance: existingAttendance,
      });
    }

    // If no existing attendance, create a new record
    const attendance = new Attendance({
      date: attendanceDate,
      grade,
      teacherId: teacher._id,
      records,
    });

    await attendance.save();

    logger.info('Attendance recorded successfully');
    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance,
    });
  } catch (error) {
    logger.error(`Error recording attendance: ${error.message}`);
    res.status(500).json({
      message: 'Error recording attendance',
    });
  }
});

/**
 * @route   GET /api/attendance
 * @desc    Get attendance records by date and optional grade
 * @access  Private (Authenticated users only)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date, grade } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }

    // Parse the date from the query parameter
    const queryDate = new Date(date + 'T00:00:00Z');

    // Get the next day to create a date range
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Build query object based on provided filters
    const query = {
      date: {
        $gte: queryDate,
        $lt: nextDay,
      },
    };
    if (grade) {
      query.grade = grade;
    }

    // Find attendance records for the specified date and optionally grade
    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'records.student',
        select: 'id name surname',
      })
      .populate({
        path: 'teacherId',
        select: 'name surname',
      });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(200).json([]);
    }

    // Group attendance records by date
    const groupedRecords = {};
    attendanceRecords.forEach((attendance) => {
      const dateKey = attendance.date.toISOString().split('T')[0];
      if (!groupedRecords[dateKey]) {
        groupedRecords[dateKey] = [];
      }
      groupedRecords[dateKey].push(attendance);
    });

    // Format the data for the frontend
    const formattedRecords = Object.keys(groupedRecords).map((dateKey) => {
      const recordsForDate = groupedRecords[dateKey];
      return {
        date: dateKey,
        records: recordsForDate.map((attendance) => ({
          grade: attendance.grade,
          teacherName: attendance.teacherId
            ? `${attendance.teacherId.name} ${attendance.teacherId.surname}`
            : 'Unknown Teacher',
          records: attendance.records.map((record) => ({
            studentId: record.studentId || 'Unknown Student ID',
            studentName: record.student
              ? `${record.student.name} ${record.student.surname}`
              : 'Unknown Student',
            status: record.status,
          })),
        })),
      };
    });

    res.status(200).json(formattedRecords);
  } catch (error) {
    logger.error(`Error fetching attendance records: ${error.message}`);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

/**
 * @route   DELETE /api/attendance
 * @desc    Delete attendance records by date
 * @access  Private (Authenticated users only)
 */
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }

    // Parse the date from the query parameter
    const queryDate = new Date(date + 'T00:00:00Z');

    // Get the next day to create a date range
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Build query object
    const query = {
      date: {
        $gte: queryDate,
        $lt: nextDay,
      },
    };

    // Delete attendance records for the specified date
    const result = await Attendance.deleteMany(query);

    if (result.deletedCount === 0) {
      return res.status(200).json({
        message: 'No attendance records found for this date to delete.',
      });
    }

    logger.info('Attendance records deleted successfully');
    res.status(200).json({ message: 'Attendance records deleted successfully.' });
  } catch (error) {
    logger.error(`Error deleting attendance records: ${error.message}`);
    res.status(500).json({ message: 'Error deleting attendance records.' });
  }
});

/**
 * @route   POST /api/attendance/send-alerts
 * @desc    Send alert emails to parents of absent students for a specific date
 * @access  Private (Authenticated users only)
 */
router.post('/send-alerts', authMiddleware, async (req, res) => {
  try {
    logger.info('POST /api/attendance/send-alerts called');
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }

    // Parse the date from the request body
    const queryDate = new Date(date + 'T00:00:00Z');

    // Fetch attendance records for the specified date
    const attendanceRecords = await Attendance.find({ date: queryDate });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this date.' });
    }

    // Collect all absent records
    let allAbsentRecords = [];
    attendanceRecords.forEach((attendance) => {
      const absentRecords = attendance.records.filter((record) => record.status === 'Absent');
      allAbsentRecords = allAbsentRecords.concat(absentRecords);
    });

    logger.info(`Number of absent records found: ${allAbsentRecords.length}`);

    if (allAbsentRecords.length === 0) {
      return res.status(200).json({ message: 'No absent students to send emails to.' });
    }

    // Send emails to parents of absent students
    await sendAbsentEmails(allAbsentRecords, date);

    res.status(200).json({ message: 'Alert emails sent successfully.' });
  } catch (error) {
    logger.error(`Error in /send-alerts route: ${error.message}`);
    res.status(500).json({ message: 'Error sending alert emails.' });
  }
});

/**
 * Function to send emails to parents of absent students
 * @param {Array} records - Array of attendance records with absent students
 * @param {String} date - Date of the attendance
 */
async function sendAbsentEmails(records, date) {
  logger.info('sendAbsentEmails called with records');

  // Extract absent students from records
  const absentRecords = records.filter((record) => record.status === 'Absent');
  logger.info(`Absent Records count: ${absentRecords.length}`);

  if (absentRecords.length === 0) {
    logger.info('No absent students to send emails to.');
    return; // No absent students
  }

  // Extract studentIds from absentRecords
  const studentIds = absentRecords.map((record) => record.studentId);
  logger.info('Student IDs:', studentIds);

  // Fetch student data for absent students
  const students = await Student.find({ id: { $in: studentIds } }).lean();
  logger.info('Fetched Students:', students);

  // Map student data by their id for easy lookup
  const studentMap = {};
  students.forEach((student) => {
    studentMap[student.id] = student;
  });

  // Send emails to parents
  const emailPromises = absentRecords.map(async (record) => {
    const student = studentMap[record.studentId];
    if (!student) {
      logger.error(`Student not found for record: ${record.studentId}`);
      return;
    }

    const parentEmail = student.parentEmail;
    const parentName = student.parentName;
    const studentName = `${student.name} ${student.surname}`;

    const subject = `Attendance Notification for ${studentName}`;
    const text = `Dear ${parentName},

We would like to inform you that your child, ${studentName}, was marked absent on ${date}.

Best regards,
Attendance System`;

    // Send email
    try {
      await sendEmail(parentEmail, subject, text);
      logger.info(`Email sent to ${parentEmail}`);
    } catch (error) {
      logger.error(`Failed to send email to ${parentEmail}: ${error.message}`);
    }
  });

  // Wait for all email promises to settle
  await Promise.allSettled(emailPromises);
}

module.exports = router;












