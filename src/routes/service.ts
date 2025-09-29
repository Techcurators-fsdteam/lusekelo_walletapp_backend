import express from 'express';
import { applyLoan, getLoans } from '../controllers/serviceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/loan', protect, applyLoan);
router.get('/loans', protect, getLoans);
// Add: router.post('/insurance', protect, applyInsurance); etc.

export default router;