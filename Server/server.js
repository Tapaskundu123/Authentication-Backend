import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import ConnectDB from './DB/MongoDB.js';
import authRoutes from './Routes/authRoutes.js'
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
app.use(
  cors({
    origin: 'http://localhost:3000', // adjust if needed for frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

// Mount routes
app.use(express.Router());

// Routes
app.get('/', (_, res) => {
  res.send("API working at '/' route");
});

app.use('/api/auth',authRoutes)
// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

