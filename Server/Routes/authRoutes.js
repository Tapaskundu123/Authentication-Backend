import express from 'express';
import {login, register, logout,sendVerifyOtp, verifyEmail } from '../Controllers/auth.controllers.js';
import { UserAuthMiddleware } from '../middleware/userAuth.js';

const authrouter= express.Router();

authrouter.post('/register',register);
authrouter.post('/login',login);
authrouter.post('/logout',logout);
authrouter.post('/sendOtp',UserAuthMiddleware,sendVerifyOtp);
authrouter.post('/verifyEmail',UserAuthMiddleware,verifyEmail);

export default authrouter;
