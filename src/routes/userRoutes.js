// src/routes/userRoutes.js
import { Router } from 'express';
const router = Router();
import roleMiddleware from '../middlewares/roleMiddleware.js';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';

// Routes accessible by 'admin' and 'user' roles
router.patch('/:id', roleMiddleware([1,2,3]), userController.updateUserProfile);
router.get('/profile', roleMiddleware([1,2,3]), userController.getUserProfile);

// Routes accessible only by 'admin' role
router.get('/all', roleMiddleware([1]), userController.getAllUsers);
router.delete('/:id', roleMiddleware([1]), userController.deleteUser);

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.loginUser);

export default router;
