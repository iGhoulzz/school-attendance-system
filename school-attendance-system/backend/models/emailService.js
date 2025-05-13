// models/emailService.js

const nodemailer = require('nodemailer');

// For testing purposes, we can use Ethereal Email
let testAccount;
let transporter;

async function initializeTransporter() {
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
}

async function sendEmail(to, subject, text) {
  console.log(`sendEmail called for ${to}`);
  await initializeTransporter();

  try {
    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Attendance System" <no-reply@attendance-system.com>',
      to,
      subject,
      text,
    });

    console.log(`Message sent: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
  }
}

module.exports = { sendEmail };

