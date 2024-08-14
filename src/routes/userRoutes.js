// src/routes/userRoutes.js
import { Router } from 'express';
const router = Router();
import roleMiddleware from '../middleware/roleMiddleware.js';
import * as userController from '../controllers/userController.js';

// Routes accessible by 'admin' and 'user' roles
router.get('/profile', roleMiddleware(['user', 'admin']), userController.getUserProfile);
router.put('/profile', roleMiddleware(['user', 'admin']), userController.updateUserProfile);

// Routes accessible only by 'admin' role
router.get('/all', roleMiddleware(['admin']), userController.getAllUsers);
router.delete('/delete/:id', roleMiddleware(['admin']), userController.deleteUser);

// Routes accessible by 'security_guard' role
router.get('/visits', roleMiddleware(['security_guard']), userController.getAllVisits);
router.put('/validate-visit/:id', roleMiddleware(['security_guard']), userController.validateVisit);

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

export default router;
