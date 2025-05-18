// models/emailService.js

const nodemailer = require('nodemailer');
const validator = require('validator');

// Gmail configuration for production use
let transporter;

// Email template cache for performance
const emailTemplates = {};

function getPasswordResetTemplate(resetUrl) {
  if (!emailTemplates.passwordReset) {
    emailTemplates.passwordReset = (url) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2963ff;">Password Reset Request</h2>
        <p>You have requested to reset your password. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" 
            style="background-color: #2963ff; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 4px; 
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you did not request this password reset, please ignore this email.</p>
      </div>
    `;
  }
  return emailTemplates.passwordReset(resetUrl);
}

async function initializeTransporter() {
  if (!transporter) {
    // Create Gmail transporter
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'school.attendance.system.edu@gmail.com',
        pass: process.env.EMAIL_PASSWORD, // This should be set in .env file
      },
    });
  }
}

// Update the exports to include all email functions
module.exports = {
  sendEmail: async ({ to, subject, text }) => {
    // Input validation
    if (!to || !validator.isEmail(to)) {
      throw new Error('Invalid email address');
    }
    
    if (!subject || !text) {
      throw new Error('Subject and text are required');
    }
    
    console.log(`sendEmail called for ${to}`);
    await initializeTransporter();
    
    try {      const info = await transporter.sendMail({
        from: '"School Attendance System" <school.attendance.system.edu@gmail.com>',
        to,
        subject,
        text,
      });
      console.log(`Message sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error.message);
      throw error;
    }
  },
  sendPasswordResetEmail: async ({ to, resetToken, resetUrl }) => {
    // Input validation
    if (!to || !validator.isEmail(to)) {
      throw new Error('Invalid email address');
    }
    
    if (!resetUrl) {
      throw new Error('Reset URL is required');
    }
      try {
      await initializeTransporter();
      
      const mailOptions = {
        from: '"School Attendance System" <school.attendance.system.edu@gmail.com>',
        to: to,
        subject: 'Password Reset Request',
        html: getPasswordResetTemplate(resetUrl)
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
};

