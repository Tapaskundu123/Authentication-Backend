// app.js
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import ConnectDB from './DB/MongoDB.js';
import authRoutes from './Routes/authRoutes.js'
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './Routes/userRoutes.js'
import { verifyBrevo, sendEmail } from './DB/brevo.js';
ConnectDB();//connect to Database
const app = express();


// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from project root
config({ path: path.resolve(__dirname, '.env') });

console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'Loaded' : 'Missing!');
console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL || 'Missing!');
// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});


const allowedOrigins = [
  process.env.FRONTEND_URL_KEY, // e.g. "https://authentication-mern-one.vercel.app"
  'https://authentication-mern-one.vercel.app',
  'https://localhost:5173'
];

app.use(
  cors({
   origin: function (origin, callback) {
    // Allow requests with no origin (like curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },// Adjust to your React app’s port
    methods: ['GET','POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  })
);


// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.js (updated CORS section)
// app.js — CORS (replace your current cors block with this)



// Routes
app.get('/', (_, res) => {
  res.send("API working at '/' route");
});

//app endpoints
app.use('/api/auth',authRoutes);
app.use('/api/user',userRoutes);


// Verify Brevo on startup (moved here for early logging)
const brevoReady = await verifyBrevo();
if (!brevoReady) {
  console.warn('⚠️ Brevo not ready—emails will fail!');
}

// Test route (unchanged)
app.get('/test-mail', async (req, res) => {
  try {
    const result = await sendEmail(
      'tapaskundu3762@gmail.com',
      'Mail test from Brevo API',
      'If you see this, your Brevo API is working perfectly!'
    );
    res.send(`✅ Test email sent successfully! Message ID: ${result.messageId}`);
  } catch (err) {
    console.error('❌ Mail test failed:', err.message);
    res.status(500).send(`Mail test failed: ${err.message}`);
  }
});

// Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});