import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import accessLogsRoutes from './routes/accesLogRoutes.js'
import cookieParser from 'cookie-parser';
import morgan from'morgan';
import cors from 'cors';

const app = express();

app.use(express.json());
// Configurar CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL, // Reemplaza con el dominio de tu frontend
    credentials: true, // Permite enviar cookies desde el frontend
    optionsSuccessStatus: 200
};
  
app.use(cors(corsOptions));
app.use(cookieParser());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/visits', visitRoutes);
app.use('/api/v1/accesslogs', accessLogsRoutes);

export default app;
