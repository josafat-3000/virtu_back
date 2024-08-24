import express from 'express';
import {getAllAccessLogs,getAccessLogById, createAccessLog, updateAccessLog,deleteAccessLog} from '../controllers/accessLogsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import { roles } from '../utils/roles.js';
const router = express.Router();

router.get('/',authMiddleware, roleMiddleware([roles.SECURITY_GUARD, roles.ADMIN]), getAllAccessLogs);
router.get('/:userId', authMiddleware, roleMiddleware([roles.USER,roles.SECURITY_GUARD, roles.ADMIN]), getAllAccessLogs);
// Crear un nuevo registro de acceso
router.post('/', authMiddleware, roleMiddleware([roles.SECURITY_GUARD,roles.SECURITY_GUARD, roles.ADMIN]), createAccessLog);

// Obtener un registro de acceso por ID
router.get('/:id', authMiddleware, roleMiddleware([roles.USER, roles.SECURITY_GUARD, roles.ADMIN]), getAccessLogById);

// Actualizar un registro de acceso
router.put('/:id', authMiddleware, roleMiddleware([roles.SECURITY_GUARD, roles.ADMIN]), updateAccessLog);

// Eliminar un registro de acceso
router.delete('/:id', authMiddleware, roleMiddleware([roles.ADMIN]), deleteAccessLog);

export default router;
