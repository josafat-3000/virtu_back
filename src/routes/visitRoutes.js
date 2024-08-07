import express from 'express';
import { createVisit, getVisits, getVisitById, updateVisitStatus } from '../controllers/visitController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createVisit);
router.get('/', authMiddleware, getVisits);
router.get('/:id', authMiddleware, getVisitById);
router.patch('/:id', authMiddleware, updateVisitStatus);

export default router;
