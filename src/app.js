import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import accessLogsRoutes from './routes/accesLogRoutes.js';
import uploadFilesRoutes from './routes/docsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';


import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
// Configurar CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL, // Reemplaza con el dominio de tu frontend
    credentials: true, // Permite enviar cookies desde el frontend
    optionsSuccessStatus: 200
};
//dmcpasmcxpasgit 
app.use(cookieParser());
app.use(cors(corsOptions));

app.use((req, res, next) => {
    console.log("Nueva solicitud recibida:");
    console.log(`Método: ${req.method}`);
    console.log(`URL: ${req.originalUrl}`);
    console.log("Headers:", req.headers);
    
    if (Object.keys(req.body).length) {
      console.log("Cuerpo:", req.body);
    }
  
    console.log("------------------------------------------------");
    next(); // Pasar al siguiente middleware o ruta
  });
  
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/visits', visitRoutes);
app.use('/api/v1/accesslogs', accessLogsRoutes);
app.use('/api/v1/docs', uploadFilesRoutes);
app.use('/api/v1/notifications', notificationRoutes);


export default app;
