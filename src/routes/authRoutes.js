import express from 'express';
import { register, loginUser, logoutUser, forgotPassword, forgotHandler} from '../controllers/authController.js';
import { verifyResetToken } from '../middlewares/resetTokenMiddelware.js.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot',forgotPassword);
router.post('/reset',verifyResetToken,forgotHandler);
router.post('/confirm',verifyResetToken,forgotHandler);

export default router;
