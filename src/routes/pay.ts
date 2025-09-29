import express from 'express';
import { generateQR, processQRPayment } from '../controllers/payController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate', protect, generateQR);
router.post('/scan', protect, processQRPayment);  // Use /api/pay/scan

export default router;