// mailer.js
const nodemailer = require('nodemailer');

// Hardcode Gmail credentials
const SERVER_HOST = 'smtp.gmail.com';
const SERVER_EMAIL = 'andyakuliah@gmail.com';
const SERVER_PASSWORD = 'tvno dzyd ncvu ueig';
const ADMINISTRATOR_1 = 'kalajengking555@gmail.com';

// Setup transporter Gmail
const transporter = nodemailer.createTransport({
  host: SERVER_HOST,
  port: 587,
  secure: false, // true jika pakai 465
  auth: {
    user: SERVER_EMAIL,
    pass: SERVER_PASSWORD
  }
});

// Fungsi kirim email
async function sendEmail({ to = ADMINISTRATOR_1, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Admin" <${SERVER_EMAIL}>`,
      to,
      subject,
      text,
      html
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}

// Export function
module.exports = { sendEmail };
