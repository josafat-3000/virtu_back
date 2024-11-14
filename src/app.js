import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import accessLogsRoutes from './routes/accesLogRoutes.js';
import uploadFilesRoutes from './routes/docsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();

app.use(express.json());
// Configurar CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL, // Reemplaza con el dominio de tu frontend
    credentials: true, // Permite enviar cookies desde el frontend
    optionsSuccessStatus: 200
};
// Creamos un servidor HTTP basado en Express
const server = http.createServer(app);

// Configuramos Socket.io para usar el servidor HTTP
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',  // El puerto donde corre tu cliente
    methods: ['GET', 'POST', 'PUT'], // Métodos permitidos
    credentials: true,
  },
});

app.use(cookieParser());
app.use(cors(corsOptions));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/visits', visitRoutes(io));
app.use('/api/v1/accesslogs', accessLogsRoutes);
app.use('/api/v1/docs', uploadFilesRoutes);
app.use('/api/v1/notifications', notificationRoutes);


export default server;
