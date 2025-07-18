import express from 'express';
import {login, register, logout } from '../Controllers/auth.controllers.js';

const authrouter= express.Router();

authrouter.post('/register',register);
authrouter.post('/login',login);
authrouter.post('/logout',logout);

export default authrouter;
