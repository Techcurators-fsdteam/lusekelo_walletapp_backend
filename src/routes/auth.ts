import express from 'express';
import { sendOTP, verifyOTP, resendOTP, logout, getProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();


// OTP-based authentication routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);

export default router;