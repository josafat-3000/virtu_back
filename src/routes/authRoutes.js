import express from 'express';
import { register, loginUser, logoutUser, forgotPasswrod} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot',forgotPasswrod);

export default router;
