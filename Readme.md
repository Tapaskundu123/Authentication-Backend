# MERN Auth Pro – Full-Stack JWT Authentication

A **secure, production-ready** authentication system built with the **MERN stack** (MongoDB, Express, React, Node.js). Features **JWT-based login**, **email verification**, **forgot password with OTP**, **secure dashboard**, and **email delivery via Brevo (formerly Sendinblue)**.

Live Demo: [https://authentication-mern-one.vercel.app](https://authentication-mern-one.vercel.app)  
Backend API: [https://mern-auth-api.onrender.com](https://mern-auth-api.onrender.com)

---

## Features

| Feature | Description |
|--------|-------------|
| **Signup & Login** | Secure user registration and login with JWT tokens stored in **HttpOnly cookies** |
| **Email Verification** | Verify email on signup using a **6-digit code** sent via Brevo |
| **Forgot Password** | Reset password with **OTP verification** |
| **OTP Auth** | Secure 2-step verification using time-based OTP |
| **Protected Dashboard** | Access user profile only after login |
| **Brevo Email Integration** | Real transactional emails (verification, OTP, password reset) |
| **Secure Cookies** | `HttpOnly`, `Secure`, `SameSite=None` in production |
| **CORS & Helmet** | Production-grade security |
| **Responsive UI** | Built with React + Tailwind CSS (or your styling) |

---

## Tech Stack

| Layer | Technology |
|------|------------|
| **Frontend** | React, Vite, React Router, Axios, React Toastify |
| **Backend** | Node.js, Express, JWT, Bcrypt |
| **Database** | MongoDB (Mongoose ODM) |
| **Email** | Brevo (Sendinblue) SMTP/API |
| **Deployment** | Frontend: Vercel, Backend: Render / Railway |
| **Security** | Helmet, CORS, Rate Limiting (optional) |

---

## Project Structure
### Next Steps for You

1. **Create a `screenshots/` folder** in your project root.
2. **Take 4 screenshots**:
   - Login page
   - Email verification page
   - OTP page
   - Dashboard
3. **Save them as**:
   - `login.png`
   - `email-verify.png`
   - `otp-verify.png`
   - `dashboard.png`
4. **Paste this `README.md`** in your repo root.

---

**Want me to generate the actual images or add dark mode?** Just say the word!