const { createTransport } = require('nodemailer');
const dotenv = require('dotenv')
dotenv.config()
const sendMail = async (email, subject, text) => {
  try {
    // Create transporter with your email service
    const transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 465, // This is SSL; if you use TLS, set port to 587
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL, // Email account
        pass: process.env.PASSWORD // App password or email password
      }
    });

    // Send mail
    await transporter.sendMail({
      from: process.env.EMAIL, // Your email address
      to: email,               // Recipient's email address
      subject: subject,        // Email subject
      text: text               // Email content
    });

    console.log(`Email sent to ${email}`); // Logging success

  } catch (error) {
    // Log the error details
    console.error('Error sending email:', error.message || error);
    throw new Error('Unable to send OTP');
  }
};

module.exports = sendMail;

