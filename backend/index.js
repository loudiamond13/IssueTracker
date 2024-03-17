import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import debug from 'debug';
const debugServer =  debug('app:Server');
import { userRouter } from './src/routes/user.js';
import { bugRouter } from './src/routes/bug.js';
import { authRouter } from './src/routes/auth.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {authMiddleware} from '@merlin4/express-auth';

const app = express();
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('frontend/dist'));
app.use(authMiddleware(process.env.JWT_SECRET_KEY, 'authToken',{
    httpOnly:true,
    maxAge:5*60*60*1000, //5 hours in miliseconds
}));
app.use('/api/user', userRouter); // middleware
app.use('/api/bug', bugRouter);
app.use('/api/auth', authRouter);

const port = process.env.PORT || 3000; 



app.listen(port,() =>{
    debugServer(`Server is running on port http://localhost:${port}`);
});

app.get('/api',(req,res) => {
    res.send('Hello World - Lou\'s backend');
    
});