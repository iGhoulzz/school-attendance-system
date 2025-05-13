// testEmail.js
const { sendEmail } = require('./models/emailService');

(async () => {
  try {
    await sendEmail('your.email@example.com', 'Test Email', 'This is a test email.');
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
})();
