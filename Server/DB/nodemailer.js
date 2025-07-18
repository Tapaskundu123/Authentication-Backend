import nodemailer from 'nodemailer';

// Create transporter
export const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', // ✅ Brevo's SMTP host
  port: 587,                    // ✅ TLS/STARTTLS port
  secure: false,                // ❌ secure: true only for port 465
  auth: {
    user: process.env.SMTP_USER, // ✅ Your Brevo verified email or SMTP login
    pass: process.env.SMTP_PASS  // ✅ SMTP key (NOT your Brevo password)
  }
});
