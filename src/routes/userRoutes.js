// src/routes/userRoutes.js
import { Router } from 'express';
const router = Router();
import roleMiddleware from '../middlewares/roleMiddleware.js';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';

// Routes accessible by 'admin' and 'user' roles
router.get('/profile', roleMiddleware([1, 3]), userController.getUserProfile);
router.put('/profile', roleMiddleware([1, 3]), userController.updateUserProfile);

// Routes accessible only by 'admin' role
router.get('/all', roleMiddleware([1]), userController.getAllUsers);
router.delete('/delete/:id', roleMiddleware([1]), userController.deleteUser);

// Routes accessible by 'security_guard' role
router.get('/visits', roleMiddleware([2]), userController.getAllVisits);
router.put('/validate-visit/:id', roleMiddleware([2]), userController.validateVisit);

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.loginUser);

export default router;
