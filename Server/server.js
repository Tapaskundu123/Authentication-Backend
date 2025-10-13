// app.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import ConnectDB from './DB/MongoDB.js';
import authRoutes from './Routes/authRoutes.js'
import userRoutes from './Routes/userRoutes.js'

ConnectDB();//connect to Database
const app = express();

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.js (updated CORS section)
// app.js — CORS (replace your current cors block with this)
const allowedOrigins = [
  process.env.FRONTEND_URL_KEY, // e.g. "https://authentication-mern-one.vercel.app"
  'http://localhost:5173',
  'https://localhost:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g., Postman, mobile clients, or same-origin)
      if (!origin) return callback(null, true);

      // exact-match check
      if (allowedOrigins.includes(origin)) {
        // pass `true` to allow; cors will automatically set Access-Control-Allow-Origin to the request origin
        return callback(null, true);
      }

      // otherwise reject
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  })
);


// Routes
app.get('/', (_, res) => {
  res.send("API working at '/' route");
});

//app endpoints
app.use('/api/auth',authRoutes);
app.use('/api/user',userRoutes)

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});