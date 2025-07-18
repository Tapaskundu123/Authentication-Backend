import express from 'express';
import {login, register, logout,sendVerifyOtp, verifyEmail } from '../Controllers/auth.controllers.js';
import { UserAuthMiddleware } from '../middleware/userAuth.js';

const authrouter= express.Router();

authrouter.post('/register',register);
authrouter.post('/login',login);
authrouter.post('/logout',logout);
authrouter.post('/send-verify-otp',UserAuthMiddleware,sendVerifyOtp);
authrouter.post('/verify-email',UserAuthMiddleware,verifyEmail);

export default authrouter;
