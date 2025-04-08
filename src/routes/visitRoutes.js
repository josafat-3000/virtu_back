import express from 'express';
import { createVisit, getVisits, getVisitById, updateVisit, updateVisitStatus, contVisit , linkVisit, createVisitFromLink } from '../controllers/visitController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import { roles } from '../utils/roles.js';

const router = express.Router();


  router.post('/', authMiddleware, roleMiddleware([roles.USER, roles.ADMIN, roles.SECURITY_GUARD]), createVisit);
  router.post('/link', createVisitFromLink);
  router.get('/', authMiddleware, roleMiddleware([roles.USER, roles.SECURITY_GUARD, roles.ADMIN]), getVisits);
  router.get('/link',authMiddleware,roleMiddleware([roles.USER, roles.ADMIN, roles.SECURITY_GUARD]), linkVisit)
  router.get('/count', authMiddleware, roleMiddleware([roles.SECURITY_GUARD, roles.ADMIN]), contVisit);
  router.get('/:id', authMiddleware, roleMiddleware([roles.USER, roles.SECURITY_GUARD, roles.ADMIN]), getVisitById);
  router.patch('/:id', authMiddleware, roleMiddleware([roles.ADMIN, roles.USER]), updateVisit);
  // Rutas para el administrador y el guardia de seguridad
  router.patch('/:id', authMiddleware, roleMiddleware([roles.ADMIN, roles.SECURITY_GUARD]), updateVisitStatus);
  router.patch('/:id', authMiddleware, roleMiddleware([roles.ADMIN, roles.SECURITY_GUARD]), updateVisitStatus);
export default router;
