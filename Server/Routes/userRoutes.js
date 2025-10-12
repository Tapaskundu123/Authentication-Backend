// Routes/userRoutes.js
import express from 'express';
import { UserAuthMiddleware } from '../middleware/userAuth.js';
import { getUserData } from '../Controllers/user.controller.js';

const userRouter = express.Router();

userRouter.get('/data', UserAuthMiddleware, getUserData);

export default userRouter;
