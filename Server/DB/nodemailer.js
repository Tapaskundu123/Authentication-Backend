// ...existing code...
import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
const port = parseInt(process.env.SMTP_PORT, 10) || 587;
const secure = (process.env.SMTP_SECURE === 'true') || port === 465;
const user = process.env.SMTP_USER || process.env.SENDER_EMAIL;
const pass = process.env.SMTP_PASS || process.env.BREVO_SMTP_PASS;

// createTransport (correct method) and export transporter
export const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user && pass ? { user, pass } : undefined,
  tls: {
    // in production you should validate certificates; allow false in dev if needed
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

// verify transporter on startup (promise based)
transporter.verify()
  .then(() => console.log('SMTP transporter ready - emails can be sent'))
  .catch((error) => console.error('SMTP transporter verification failed:', error));

// ...existing code...