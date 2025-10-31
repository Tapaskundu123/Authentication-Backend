// app.js
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import ConnectDB from './DB/MongoDB.js';
import authRoutes from './Routes/authRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import { verifyBrevo, sendEmail } from './DB/brevo.js';

// -------------------------------------------------
// 1. Fix __dirname in ESM
// -------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------
// 2. Load .env **first** (project root)
// -------------------------------------------------
config({ path: path.resolve(__dirname, '.env') });


// -------------------------------------------------
// 3. Connect DB
// -------------------------------------------------
ConnectDB(); // MongoDB connection

// -------------------------------------------------
// 4. Express app
// -------------------------------------------------
const app = express();

// -------------------------------------------------
// 5. Production-only security
// -------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  // Helmet – sensible security defaults
  app.use(helmet());

  // Force HTTPS (most hosts set `x-forwarded-proto`)
  app.use((req, res, next) => {
    if (req.get('x-forwarded-proto') && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
    next();
  });
}

// -------------------------------------------------
// 6. CORS – only your real front-end domain in prod
// -------------------------------------------------
const allowedOrigins = [
  process.env.FRONTEND_URL_KEY, // e.g. https://yourapp.vercel.app
  // localhost only for dev
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173'] : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools with no origin (Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS blocked'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// -------------------------------------------------
// 7. Core middleware
// -------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieParser(),
  // **SECURE COOKIES** – only sent over HTTPS in production
  (req, res, next) => {
    const isProd = process.env.NODE_ENV === 'production';
    req.cookieOptions = {
      httpOnly: true,
      secure: isProd,          // <-- secure: true in prod
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day (adjust as needed)
    };
    next();
  }
);

// -------------------------------------------------
// 8. Request logger (dev only)
// -------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  });
}

// -------------------------------------------------
// 9. Routes
// -------------------------------------------------
app.get('/', (_, res) => res.send('API is live'));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// -------------------------------------------------
// 10. Brevo verification (run once at startup)
// -------------------------------------------------
(async () => {
  const ready = await verifyBrevo();
  if (!ready) {
    console.warn('Brevo not ready – email functions will fail');
  }
})();

// -------------------------------------------------
// 11. Test-mail route – **DISABLED in production**
// -------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  app.get('/test-mail', async (req, res) => {
    try {
      const result = await sendEmail(
        'tapaskundu3762@gmail.com',
        'Mail test from Brevo API',
        'If you see this, your Brevo API is working perfectly!'
      );
      res.send(
        `Test email sent successfully! Message ID: ${result.messageId}`
      );
    } catch (err) {
      console.error('Mail test failed:', err.message);
      res.status(500).send(`Mail test failed: ${err.message}`);
    }
  });
 }

// -------------------------------------------------
// 12. Global error handler (optional but nice)
// -------------------------------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// -------------------------------------------------
// 13. Start server
// -------------------------------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});