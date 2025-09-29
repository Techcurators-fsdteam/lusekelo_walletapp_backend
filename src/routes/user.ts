import express from 'express';
import { getProfile, updateSettings, checkBalance, setPin, verifyPin } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/settings', protect, updateSettings);
router.get('/balance', protect, checkBalance);
router.post('/set-pin', protect, setPin);
router.post('/verify-pin', protect, verifyPin);

export default router;