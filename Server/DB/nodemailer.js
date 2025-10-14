// nodemailer.js
import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const port = parseInt(process.env.SMTP_PORT, 10) || 587;
const secure = process.env.SMTP_SECURE === 'true'; // false for port 587
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  tls: {
    // Allow self-signed certificates only in dev
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

// Verify transporter connection on server start
transporter.verify()
  .then(() => console.log('✅ SMTP transporter ready - emails can be sent'))
  .catch((error) => console.error('❌ SMTP transporter verification failed:', error));
