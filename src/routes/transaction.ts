import express from 'express';
import { getHistory, sendMoney, receiveMoney } from '../controllers/transactionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/history', protect, getHistory);
router.post('/send', protect, sendMoney);
router.post('/receive', protect, receiveMoney);
// Add more: router.post('/recharge', protect, mobileRecharge); etc.

export default router;