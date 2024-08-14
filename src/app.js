import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import cookieParser from 'cookie-parser';
import morgan from'morgan';
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/visits', visitRoutes);

export default app;
