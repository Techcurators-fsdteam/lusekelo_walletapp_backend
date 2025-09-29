import { Request, Response } from 'express';
import Transaction from '../models/transaction';
import User from '../models/user';
import axios from 'axios';


// Get Transaction History
export const getHistory = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find({ userId: (req as any).user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Send Money (mock; integrate payment gateway later)
export const sendMoney = async (req: Request, res: Response) => {
  const { amount, toMobileOrName, description } = req.body;
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.balance < amount) return res.status(400).json({ msg: 'Insufficient balance' });

    // Call external API (e.g., Selcom)
    const response = await axios.post('https://api.selcom.net/v1/payments', {
      amount,
      currency: 'TZS',  // Or the correct currency
      recipient: toMobileOrName,
      description,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SELCOM_KEY}`,
      },
    });

    if (response.data.status === 'success') {
      // Deduct user balance
      user.balance -= amount;
      await user.save();

      // Save transaction
      const transaction = new Transaction({
        userId: user._id,
        type: 'send',
        amount: -amount,
        description: `Sent to ${toMobileOrName} via Selcom`,
      });
      await transaction.save();

      res.json({
        msg: 'Payment successful',
        transactionId: response.data.transactionId || response.data.id,
        newBalance: user.balance,
      });
    } else {
      res.status(400).json({ msg: 'Payment failed', error: response.data.message || 'Unknown error' });
    }

  } catch (err) {
 const error = err as Error;
  console.error('Payment error:', error.message);
  res.status(500).json({ msg: 'Server error during payment' });
  }
};
// Receive Money (similar mock)
export const receiveMoney = async (req: Request, res: Response) => {
  const { amount, from } = req.body;  // from could be QR or user
  try {
    const user = await User.findById((req as any).user.id);
if(!user) return res.status(404).json({ msg: 'User not found' });

    user!.balance += amount;
    await user.save();

    const transaction = new Transaction({
      userId: user._id,
      type: 'receive',
      amount,
      description: `Received from ${from}`,
    });
    await transaction.save();

    res.json({ msg: 'Money received', newBalance: user.balance });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Other services (e.g., Recharge/Bill) can follow similar pattern
// Example: Mobile Recharge (mock)
export const mobileRecharge = async (req: Request, res: Response) => {
  const { amount, mobileNumber } = req.body;
  // Similar to sendMoney, but type: 'recharge'
  // Integrate with recharge API in real app
};