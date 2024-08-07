import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import visitRoutes from './routes/visitRoutes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/visits', visitRoutes);

export default app;
