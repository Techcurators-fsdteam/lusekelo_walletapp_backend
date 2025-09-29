import { Request, Response } from 'express';
import Loan from '../models/loan';
import User from '../models/user';

// Apply for Loan (mock approval)
export const applyLoan = async (req: Request, res: Response) => {
  const { type, amount, emiAmount } = req.body;
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Mock: Check eligibility (e.g., balance > 0)
    if (user.balance < 1000) return res.status(400).json({ msg: 'Insufficient eligibility' });

    const loan = new Loan({
      userId: user._id,
      type,
      amount,
      emiAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),  // 30 days
      status: 'approved',  // Mock instant approval
    });
    await loan.save();

    // Credit loan to balance
    user.balance += amount;
    await user.save();

    // Log transaction
    // Use Transaction model here if needed

    res.json({ loan, msg: 'Loan approved and credited' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get Loans (for dashboard)
export const getLoans = async (req: Request, res: Response) => {
  try {
    const loans = await Loan.find({ userId: (req as any).user.id });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// For Insurance/SIPs: Similar mock endpoint, e.g., POST /api/service/insurance { plan: 'health', premium: 100 }
// Create a Service model later for generality.