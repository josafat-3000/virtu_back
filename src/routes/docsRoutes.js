// routes/uploadRoutes.js
import express from 'express';
import { uploadFile } from '../controllers/docsController.js';

const router = express.Router();

// Ruta para subir un archivo
router.post('/upload', uploadFile);

export default router;