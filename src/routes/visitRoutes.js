import express from 'express';
import { createVisit, getVisits, getVisitById, updateVisitStatus, contVisit } from '../controllers/visitController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import { roles } from '../utils/roles.js';

const router = express.Router();


  router.post('/', authMiddleware, roleMiddleware([roles.USER, roles.ADMIN, roles.SECURITY_GUARD]), createVisit);
  router.get('/', authMiddleware, roleMiddleware([roles.USER, roles.SECURITY_GUARD, roles.ADMIN]), getVisits);
  router.get('/count', authMiddleware, roleMiddleware([roles.SECURITY_GUARD, roles.ADMIN]), contVisit);
  router.get('/:id', authMiddleware, roleMiddleware([roles.USER, roles.SECURITY_GUARD, roles.ADMIN]), getVisitById);

  // Rutas para el administrador y el guardia de seguridad
  router.patch('/:id', authMiddleware, roleMiddleware([roles.ADMIN, roles.SECURITY_GUARD]), updateVisitStatus);

export default router;
