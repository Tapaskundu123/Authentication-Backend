// app.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import ConnectDB from './DB/MongoDB.js';
import authRoutes from './Routes/authRoutes.js'
import userRoutes from './Routes/userRoutes.js'
// eg test email
import { transporter } from './DB/nodemailer.js';

ConnectDB();//connect to Database
const app = express();

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


app.get('/test-mail', async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: 'tapaskundu3762@gmail.com',
      subject: 'Mail test from Brevo',
      text: 'If you see this, your Brevo SMTP is working perfectly!',
    });
    res.send('✅ Test email sent successfully!');
  } catch (err) {
    console.error('❌ Mail test failed:', err);
    res.status(500).send('Mail test failed. Check console for details.');
  }
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});