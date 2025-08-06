import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});


// Verify the transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Nodemailer transporter error:', error);
    } else {
        console.log('Nodemailer transporter is ready to send emails!');
    }
});

export default transporter;