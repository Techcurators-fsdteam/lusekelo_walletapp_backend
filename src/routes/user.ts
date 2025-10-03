import express from 'express';
import { getProfile, updateSettings, checkBalance, setPin, verifyPin, updateAvatar } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import upload from '../models/upload';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/settings', protect, updateSettings);
router.get('/balance', protect, checkBalance);
router.post('/set-pin', protect, setPin);
router.post('/verify-pin', protect, verifyPin);
router.post("/avatar", protect, upload.single("avatar"), updateAvatar);


export default router;