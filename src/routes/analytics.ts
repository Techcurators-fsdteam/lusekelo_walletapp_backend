import express from 'express';
import { getAnalytics, getCategoryBreakdown, getTransactionTrends } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/summary', protect, getAnalytics);
router.get('/categories', protect, getCategoryBreakdown);
router.get('/trends', protect, getTransactionTrends);

export default router;
