const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // App password
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Mail Server Connection Error:', error);
  } else {
    console.log('Mail Server is ready to take our messages');
  }
});

module.exports = transporter;
