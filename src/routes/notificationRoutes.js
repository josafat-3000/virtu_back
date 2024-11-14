import { Router } from 'express';
const router = Router();
import {createNotification, getNotifications} from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

router.get('/', authMiddleware,roleMiddleware([1,2,3]), getNotifications);
router.post('/',authMiddleware,roleMiddleware([1,2,3]), createNotification);
export default router;